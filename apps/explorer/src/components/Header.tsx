import { AppShell, Container, Group, Image, Title } from '@mantine/core'

import ceramicLogo from '../../assets/ceramic.svg'

export default function Header() {
  return (
    <AppShell.Header>
      <Container p="sm" size="lg">
        <Group>
          <Image src={ceramicLogo} h="45px" w="45px" />
          <Title>Ceramic Explorer</Title>
        </Group>
      </Container>
    </AppShell.Header>
  )
}
