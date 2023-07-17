import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { signOut, useSession } from "next-auth/react";

export default function Login() {
    const { data: session, status } = useSession()
    if (status === 'unauthenticated') {
        return (

            <Flex justifyContent="center" w="100%" flexDirection="column" h="100vh">
                <Box display="flex" justifyContent="center" >

                    <Text fontSize="3xl" color="#850C87">Todo App</Text>
                </Box>
                <Box display="flex" justifyContent="center" >

                    <Image src="/images/logo.png" alt="logo" w="250" h="250" />
                </Box>
                <Box display="flex" justifyContent="center" mt="5" >

                    <Button onClick={() => signIn()} display="flex" justifyContent="space-around" p="6" w="250px" type="submit" bgColor="#850C87" color='#fff' _hover={{ bg: "#C41FC7", transitionDuration: '0.2s' }}>
                        <Image src="/images/github-mark-white.svg" alt="github" w="25" h="25" />
                        <span>Logar com GitHub</span>
                    </Button>
                </Box>

            </Flex>
        )
    }

}