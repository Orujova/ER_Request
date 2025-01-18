import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setRequest, addMessage, setMessages } from "./requestSlice";
import { Send, Paperclip, Link2, Mail, Check, X } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";
import { styled } from "@stitches/react";

// Styled Components with Stitches
const StyledCard = styled("div", {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  padding: "24px",
  marginBottom: "20px",
});

const StyledButton = styled("button", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  borderRadius: "6px",
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: 1,
  cursor: "pointer",
  border: "none",
  transition: "all 0.2s",

  variants: {
    variant: {
      primary: {
        backgroundColor: "#3b82f6",
        color: "white",
        "&:hover": { backgroundColor: "#2563eb" },
      },
      secondary: {
        backgroundColor: "#f3f4f6",
        color: "#374151",
        "&:hover": { backgroundColor: "#e5e7eb" },
      },
      success: {
        backgroundColor: "#10b981",
        color: "white",
        "&:hover": { backgroundColor: "#059669" },
      },
      danger: {
        backgroundColor: "#ef4444",
        color: "white",
        "&:hover": { backgroundColor: "#dc2626" },
      },
      ghost: {
        backgroundColor: "transparent",
        color: "#6b7280",
        "&:hover": { backgroundColor: "#f3f4f6" },
      },
    },
    size: {
      sm: { padding: "6px 12px", fontSize: "12px" },
      md: { padding: "10px 16px", fontSize: "14px" },
      lg: { padding: "12px 20px", fontSize: "16px" },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const StyledInput = styled("input", {
  width: "100%",
  padding: "10px 16px",
  borderRadius: "6px",
  border: "1px solid #e5e7eb",
  fontSize: "14px",
  transition: "all 0.2s",
  outline: "none",

  "&:focus": {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
  },
});

const StyledBadge = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 12px",
  borderRadius: "9999px",
  fontSize: "12px",
  fontWeight: 500,

  variants: {
    variant: {
      inProgress: {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      },
      completed: {
        backgroundColor: "#d1fae5",
        color: "#065f46",
      },
      pending: {
        backgroundColor: "#e0f2fe",
        color: "#075985",
      },
    },
  },
});

const StyledTabs = styled(Tabs.Root, {
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const StyledTabsList = styled(Tabs.List, {
  display: "flex",
  borderBottom: "1px solid #e5e7eb",
  marginBottom: "24px",
});

const StyledTabsTrigger = styled(Tabs.Trigger, {
  padding: "12px 20px",
  border: "none",
  background: "none",
  fontSize: "14px",
  fontWeight: 500,
  color: "#6b7280",
  cursor: "pointer",
  borderBottom: "2px solid transparent",
  transition: "all 0.2s",

  '&[data-state="active"]': {
    color: "#3b82f6",
    borderBottomColor: "#3b82f6",
  },

  "&:hover": {
    color: "#3b82f6",
  },
});

const StyledScrollArea = styled(ScrollArea.Root, {
  height: "400px",
  padding: "16px",
  paddingRight: "24px",
});

const ScrollViewport = styled(ScrollArea.Viewport, {
  width: "100%",
  height: "100%",
  borderRadius: "inherit",
});

const ScrollBar = styled(ScrollArea.Scrollbar, {
  display: "flex",
  userSelect: "none",
  touchAction: "none",
  padding: "2px",
  background: "#f3f4f6",
  transition: "background 160ms ease-out",
  '&[data-orientation="vertical"]': { width: "10px" },
  '&[data-orientation="horizontal"]': {
    height: "10px",
    flexDirection: "column",
  },
});

const ScrollThumb = styled(ScrollArea.Thumb, {
  flex: 1,
  background: "#9ca3af",
  borderRadius: "9999px",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100%",
    minWidth: "44px",
    minHeight: "44px",
  },
});

function RequestDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const request = useSelector((state) => state.request.currentRequest);
  const messages = useSelector((state) => state.request.messages);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const mockRequest = {
      id,
      case: "Davamiyyət",
      subCase: "İşə gecikmə",
      status: "In Progress",
      employeeInfo: {
        badge: "EMP123",
        name: "John Smith",
        position: "Developer",
        department: "IT",
        businessUnit: "Technology",
        project: "ER System",
      },
      mailInfo: {
        email: "john@example.com",
        cc: "manager@example.com",
        body: "Request details...",
      },
      attachments: ["presentation.pptx", "document.pdf"],
      hyperlinks: ["https://example.com"],
      erMember: "Sarah Johnson",
    };

    dispatch(setRequest(mockRequest));
    dispatch(
      setMessages([
        {
          id: 1,
          sender: "John Doe",
          message: "Initial message",
          timestamp: new Date().toLocaleString(),
        },
      ])
    );
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

  if (!request) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Request #{id}
          </h1>
          <StyledBadge
            variant={
              request.status === "In Progress" ? "inProgress" : "completed"
            }
          >
            {request.status}
          </StyledBadge>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <StyledButton variant="ghost" size="sm">
            <Mail size={16} />
            Export
          </StyledButton>
          <StyledButton variant="ghost" size="sm">
            Print
          </StyledButton>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
        }}
      >
        {/* Left Column */}
        <div>
          <StyledTabs defaultValue="case">
            <StyledTabsList>
              <StyledTabsTrigger value="case">Case Info</StyledTabsTrigger>
              <StyledTabsTrigger value="employee">Employee</StyledTabsTrigger>
              <StyledTabsTrigger value="mail">Mail</StyledTabsTrigger>
              <StyledTabsTrigger value="attachments">
                Attachments
              </StyledTabsTrigger>
            </StyledTabsList>

            <Tabs.Content value="case">
              <StyledCard>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    marginBottom: "20px",
                  }}
                >
                  Case Information
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Case
                    </div>
                    <div style={{ color: "#111827" }}>{request.case}</div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Sub Case
                    </div>
                    <div style={{ color: "#111827" }}>{request.subCase}</div>
                  </div>
                </div>
              </StyledCard>
            </Tabs.Content>

            <Tabs.Content value="employee">
              <StyledCard>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    marginBottom: "20px",
                  }}
                >
                  Employee Information
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  {Object.entries(request.employeeInfo).map(([key, value]) => (
                    <div key={key}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                      <div style={{ color: "#111827" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </StyledCard>
            </Tabs.Content>

            <Tabs.Content value="mail">
              <StyledCard>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    marginBottom: "20px",
                  }}
                >
                  Mail Information
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {Object.entries(request.mailInfo).map(([key, value]) => (
                    <div key={key}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                      <div style={{ color: "#111827" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </StyledCard>
            </Tabs.Content>

            <Tabs.Content value="attachments">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                <StyledCard>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      marginBottom: "20px",
                    }}
                  >
                    Attachments
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {request.attachments.map((file, index) => (
                      <StyledButton
                        key={index}
                        variant="ghost"
                        style={{ justifyContent: "flex-start", width: "100%" }}
                      >
                        <Paperclip size={16} />
                        {file}
                      </StyledButton>
                    ))}
                  </div>
                </StyledCard>

                <StyledCard>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      marginBottom: "20px",
                    }}
                  >
                    Hyperlinks
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {request.hyperlinks.map((link, index) => (
                      <StyledButton
                        key={index}
                        variant="ghost"
                        style={{ justifyContent: "flex-start", width: "100%" }}
                        as="a"
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Link2 size={16} />
                        {link}
                      </StyledButton>
                    ))}
                  </div>
                </StyledCard>
              </div>
            </Tabs.Content>
          </StyledTabs>
        </div>

        {/* Right Column */}
        <div>
          <StyledCard>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              Actions
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <StyledButton variant="secondary">
                <Mail size={16} />
                Send Mail
              </StyledButton>
              <StyledButton variant="success">
                <Check size={16} />
                Approve
              </StyledButton>
              <StyledButton variant="danger">
                <X size={16} />
                Reject
              </StyledButton>
            </div>
          </StyledCard>

          <StyledCard style={{ marginTop: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              Chat
            </h3>
            <StyledScrollArea>
              <ScrollViewport>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                          msg.sender === "Current User"
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>
                          {msg.sender}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          {msg.timestamp}
                        </span>
                      </div>
                      <div
                        style={{
                          maxWidth: "80%",
                          padding: "12px",
                          borderRadius: "8px",
                          background:
                            msg.sender === "Current User"
                              ? "#eff6ff"
                              : "#f3f4f6",
                          color:
                            msg.sender === "Current User"
                              ? "#1e40af"
                              : "#374151",
                        }}
                      >
                        <span style={{ fontSize: "14px" }}>{msg.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollViewport>
              <ScrollBar orientation="vertical">
                <ScrollThumb />
              </ScrollBar>
            </StyledScrollArea>

            <Separator.Root
              style={{
                height: "1px",
                backgroundColor: "#e5e7eb",
                margin: "16px 0",
              }}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <StyledInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
              />
              <StyledButton
                variant="primary"
                onClick={handleSendMessage}
                style={{ padding: "10px", width: "auto" }}
              >
                <Send size={16} />
              </StyledButton>
            </div>
          </StyledCard>
        </div>
      </div>
    </div>
  );
}

export default RequestDetail;
