import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setRequest, addMessage, setMessages } from "./requestSlice";
import {
  Send,
  Paperclip,
  Link2,
  Mail,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

// Helper function to convert ERRequestStatus enum to readable text
const getStatusText = (statusCode) => {
  switch (statusCode) {
    case 0:
      return "Pending";
    case 1:
      return "Under Review";
    case 2:
      return "Decision Made";
    case 3:
      return "Order Created";
    case 4:
      return "Completed";
    case 5:
      return "Order Canceled";
    default:
      return "Unknown";
  }
};

function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const request = useSelector((state) => state.request.currentRequest);
  const messages = useSelector((state) => state.request.messages);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        setLoading(true);
        const { token } = getStoredTokens();

        const response = await fetch(`${API_BASE_URL}/api/ERRequest/${id}`, {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching request data: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to match our component structure
        const transformedRequest = {
          id: data.Id,
          case: data.CaseName,
          subCase: data.SubCaseDescription,
          status: getStatusText(data.ERRequestStatus),
          employeeInfo: {
            name: data.EmployeeName,
            project: data.ProjectName,
            projectCode: data.ProjectCode,
            employee_id: data.EmployeeId,
          },
          mailInfo: {
            email: data.MailToAdresses,
            cc: data.MailCcAddresses,
            body: data.MailBody,
          },
          attachments: [], // API doesn't provide this information
          hyperlinks: data.ERHyperLink ? [data.ERHyperLink] : [],
          erMember: data.ERMember,
          createdDate: data.CreatedDate,
        };

        dispatch(setRequest(transformedRequest));

        // You would also fetch messages here if there's an API endpoint for that
        dispatch(
          setMessages([
            {
              id: 1,
              sender: data.EmployeeName,
              message: "Initial request",
              timestamp: new Date(data.CreatedDate).toLocaleString(),
            },
          ])
        );

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRequestData();
  }, [dispatch, id]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      dispatch(
        addMessage({
          id: Date.now(),
          sender: "Current User",
          message: newMessage,
          timestamp: new Date().toLocaleString(),
        })
      );
      setNewMessage("");
    }
  };

  const navigateToAction = () => {
    navigate(`/request/${id}/action`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!request)
    return <div className="text-gray-500 p-4">Request not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            Request #{id}
          </h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${
              request.status === "Pending"
                ? "bg-gray-100 text-gray-800"
                : request.status === "Under Review"
                ? "bg-amber-100 text-amber-800"
                : request.status === "Decision Made"
                ? "bg-blue-100 text-blue-800"
                : request.status === "Order Created"
                ? "bg-purple-100 text-purple-800"
                : request.status === "Completed"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {request.status}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            onClick={navigateToAction}
          >
            <ArrowRight size={16} />
            Go to Action
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px" aria-label="Tabs">
                <button className="border-blue-500 text-blue-600 px-5 py-3 text-sm font-medium border-b-2">
                  Case Info
                </button>
                <button className="text-gray-500 hover:text-gray-700 hover:border-gray-300 px-5 py-3 text-sm font-medium border-b-2 border-transparent">
                  Employee
                </button>
                <button className="text-gray-500 hover:text-gray-700 hover:border-gray-300 px-5 py-3 text-sm font-medium border-b-2 border-transparent">
                  Mail
                </button>
                <button className="text-gray-500 hover:text-gray-700 hover:border-gray-300 px-5 py-3 text-sm font-medium border-b-2 border-transparent">
                  Attachments
                </button>
              </nav>
            </div>

            {/* Case Info Tab Content */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold mb-5">Case Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="font-medium text-gray-500 mb-1">Case</div>
                  <div className="text-gray-900">{request.case}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500 mb-1">Sub Case</div>
                  <div className="text-gray-900">{request.subCase}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500 mb-1">
                    Created Date
                  </div>
                  <div className="text-gray-900">{request.createdDate}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500 mb-1">
                    ER Member
                  </div>
                  <div className="text-gray-900">{request.erMember}</div>
                </div>
              </div>
            </div>

            {/* Employee Info Tab Content */}
            <div className="bg-white rounded-lg shadow p-6 mt-6 hidden">
              <h3 className="text-lg font-semibold mb-5">
                Employee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Object.entries(request.employeeInfo).map(([key, value]) => (
                  <div key={key}>
                    <div className="font-medium text-gray-500 mb-1">
                      {key.charAt(0).toUpperCase() +
                        key.slice(1).replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mail Info Tab Content */}
            <div className="bg-white rounded-lg shadow p-6 mt-6 hidden">
              <h3 className="text-lg font-semibold mb-5">Mail Information</h3>
              <div className="flex flex-col gap-5">
                {Object.entries(request.mailInfo).map(([key, value]) => (
                  <div key={key}>
                    <div className="font-medium text-gray-500 mb-1">
                      {key.charAt(0).toUpperCase() +
                        key.slice(1).replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments Tab Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-5">Attachments</h3>
                <div className="flex flex-col gap-2">
                  {request.attachments && request.attachments.length > 0 ? (
                    request.attachments.map((file, index) => (
                      <button
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left w-full transition-colors"
                      >
                        <Paperclip size={16} />
                        {file}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500">No attachments</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-5">Hyperlinks</h3>
                <div className="flex flex-col gap-2">
                  {request.hyperlinks && request.hyperlinks.length > 0 ? (
                    request.hyperlinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left w-full transition-colors"
                      >
                        <Link2 size={16} />
                        {link}
                      </a>
                    ))
                  ) : (
                    <p className="text-gray-500">No hyperlinks</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Takes 1/3 of the space */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col gap-2">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                <Mail size={16} />
                Send Mail
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-5">Chat</h3>
            <div className="h-96 overflow-y-auto mb-4 pr-2">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "Current User"
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{msg.sender}</span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === "Current User"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <span className="text-sm">{msg.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="inline-flex items-center justify-center p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestDetail;
