import { Container, Group, Image, Title } from '@mantine/core'

import ceramicLogo from '../../public/ceramic.svg'

import classes from './Header.module.css'

export default function Header() {
  return (
    <header className={classes.header}>
      <Container size="md">
        <Group>
          <Image src={ceramicLogo} h="60px" w="60px" />
          <Title>Ceramic Explorer</Title>
        </Group>
      </Container>
    </header>
  )
}
