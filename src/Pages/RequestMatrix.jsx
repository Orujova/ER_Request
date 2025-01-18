import { Table, Text, Flex } from "@radix-ui/themes";

function RequestMatrix() {
  const matrix = [
    { case: "Davamiyyət", subCase: "İşə gecikmə" },
    { case: "Davamiyyət", subCase: "Bir gün tam işə gəlməmə" },
    { case: "Davamiyyət", subCase: "3 gün və daha çox işə gəlməmək" },
    { case: "Oğurluq", subCase: "Wastage oğurluq" },
    { case: "Oğurluq", subCase: "Kassadan oğurluq" },
    { case: "Oğurluq", subCase: "Seyfdən oğurluq" },
    { case: "Oğurluq", subCase: "Məhsul oğurluğu" },
    { case: "Oğurluq", subCase: "Avadanlıq oğurluğu" },
  ];

  return (
    <Flex direction="column" gap="4" p="4">
      <Text size="5" weight="bold">
        Request Type Matrix
      </Text>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Case</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Sub Case</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {matrix.map((item, index) => (
            <Table.Row key={index}>
              <Table.Cell>{item.case}</Table.Cell>
              <Table.Cell>{item.subCase}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}

export default RequestMatrix;
