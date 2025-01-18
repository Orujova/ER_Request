import { Table, Select, Button, Flex, Text } from "@radix-ui/themes";

function AdminPanel() {
  return (
    <Flex direction="column" gap="4" p="4">
      <Text size="5" weight="bold">
        Admin Panel
      </Text>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Area</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Area Manager</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>ER Member</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Select.Root>
                <Select.Trigger placeholder="Select Area" />
                <Select.Content>
                  <Select.Item value="area1">Area 1</Select.Item>
                  <Select.Item value="area2">Area 2</Select.Item>
                </Select.Content>
              </Select.Root>
            </Table.Cell>
            <Table.Cell>
              <Select.Root>
                <Select.Trigger placeholder="Select Manager" />
                <Select.Content>
                  <Select.Item value="manager1">Manager 1</Select.Item>
                  <Select.Item value="manager2">Manager 2</Select.Item>
                </Select.Content>
              </Select.Root>
            </Table.Cell>
            <Table.Cell>
              <Select.Root>
                <Select.Trigger placeholder="Select ER Member" />
                <Select.Content>
                  <Select.Item value="member1">Member 1</Select.Item>
                  <Select.Item value="member2">Member 2</Select.Item>
                </Select.Content>
              </Select.Root>
            </Table.Cell>
            <Table.Cell>
              <Button>Save</Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}

export default AdminPanel;
