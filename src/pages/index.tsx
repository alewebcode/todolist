import { Box, Button, Container, Flex, Text, IconButton, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Progress, CircularProgress, useColorModeValue } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { FiEdit, FiLogOut, FiPlusCircle, FiTrash2, FiMoon, FiSun } from "react-icons/fi";
import { useColorMode } from '@chakra-ui/color-mode'
import { ModalAction } from "@/component/modal";
import { format, formatDistance, formatDistanceToNow, formatISO9075, intervalToDuration, parseISO } from 'date-fns';
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import { Link } from '@chakra-ui/react'
import { useRouter } from "next/router";
import { NextResponse } from "next/server";
import ptBR from 'date-fns/locale/pt-BR';
import { signOut, useSession } from "next-auth/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./login";


interface ITasks {
  id: number;
  description: string;
  timeline: string;
  due_date: string;
  completed: boolean;
}



export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [tasks, setTasks] = useState<ITasks[]>([])
  const [checkTask, setCheckTask] = useState(false)
  const [data, setData] = useState<ITasks>()
  const [loading, setLoading] = useState(false)
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('#F5F5F5', '#000')
  const color = useColorModeValue('#000', '#FFF')

  useEffect(() => {

    async function listTasks() {

      setLoading(true)

      const response = await fetch('api/', {
        method: 'GET'
      }).then((resp) => {
        return resp.json()

      }).catch((e) => {
        setLoading(false)

        return toast.error('Ocorreu um erro ao listar!', {
          position: toast.POSITION.TOP_RIGHT
        });



      })


      if (response.query.data) {

        const data = response.query.data.map((elem) => {

          elem.data.id = elem.ref['@ref'].id
          elem.data.description = elem.data.description



          const object_date = new Date(elem.data.due_date)



          const res = intervalToDuration({
            start: new Date(),
            end: new Date(object_date.getFullYear(), object_date.getMonth(), object_date.getDate() + 1)
          })


          if (new Date() >= object_date || res.days <= 3) {

            elem.data.timeline = 'end'
            return elem.data
          }

          if (res.days > 3 && res.days < 7) {
            elem.data.timeline = 'middle'
            return elem.data
          }

          if (res.days >= 7) {
            elem.data.timeline = 'start'
            return elem.data
          }



        })


        setTasks(data)
      }



      setLoading(false)


    }


    listTasks()


  }, [])

  function handleModal() {

    setShowModal(!showModal)

    setData(null)

  }
  function editHandleModal(task) {


    setShowModal(!showModal)

    setData(task)

  }

  async function markTask(id, completed) {
    completed = !completed


    try {
      await fetch('api/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed })
      })



      const findTask = tasks.findIndex((elem) => {
        return elem.id == id
      })

      tasks[findTask].completed = completed

      const tTasks = [...tasks]

      setTasks(tTasks)

    }
    catch (error) {

      return toast.error('Ocorreu um erro ao salvar!', {
        position: toast.POSITION.TOP_RIGHT
      });
    }

  }

  async function deleteTask(id) {

    try {
      await fetch('api/' + id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })


      const task = tasks.filter((elem) => {
        return elem.id != id
      })



      setTasks(task)

    }
    catch (error) {

      return toast.error('Ocorreu um erro ao deletar!', {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  }
  function updateTasks(arr) {

    const object_date = new Date(arr.due_date)


    const res = intervalToDuration({
      start: new Date(),
      end: new Date(object_date.getFullYear(), object_date.getMonth(), object_date.getDate() + 1)
    })


    if (new Date() >= object_date || res.days <= 3) {

      arr.timeline = 'end'

    }

    if (res.days > 3 && res.days < 7) {
      arr.timeline = 'middle'

    }

    if (res.days >= 7) {
      arr.timeline = 'start'

    }




    const findTask = tasks.findIndex((elem) => {
      return elem.id == arr.id
    })


    if (findTask !== -1) {
      tasks[findTask].description = arr.description
      tasks[findTask].due_date = arr.due_date
      tasks[findTask].timeline = arr.timeline

      const tTasks = [...tasks]

      setTasks(tTasks)

      return
    }



    setTasks([...tasks, arr])

  }

  if (status === 'authenticated') {
    return (


      <Container maxW='container.xl' >

        <IconButton aria-label="Toggle Mode" onClick={toggleColorMode} bg="none" borderRadius="full">
          {colorMode === 'light' ? <FiMoon /> : <FiSun />}
        </IconButton>

        <ToastContainer />
        <Flex minH={"100vh"} flexDirection="column">

          <Box display="flex" p="0" justifyContent="space-between" alignItems="center" borderBottom="1px solid #C6C0C0">
            <Text fontSize={32} color="#850C87" >TodoApp</Text>

            <Link _hover={{ opacity: "0.7", transitionDuration: '0.2s' }} onClick={() => signOut()} ><FiLogOut size={20} color="#850C87" /></Link>
          </Box>



          <Box display="flex" justifyContent="center" width="100%" pt={7}>
            <Button rightIcon={<FiPlusCircle size={20} />} bgColor="#850C87" color="#fff" borderRadius="20" width={206} _hover={{ bg: "#C41FC7", transitionDuration: '0.2s' }} onClick={handleModal}>
              Adicionar

            </Button>

          </Box>
          <ModalAction isOpen={showModal} onClose={handleModal} dataForm={data} user={session.user.email} updateTasks={updateTasks} />

          {loading ? <CircularProgress isIndeterminate color='green.300' display="flex" justifyContent="center" mt="50px" /> :
            <Box display="flex" mt={10} borderRadius="10" bg={bg} color={color}>

              {tasks.length ?

                <TableContainer width="100%" p={5}>
                  <Table variant='simple'>

                    <Thead>
                      <Tr>
                        <Th>Tarefa</Th>
                        <Th>Timeline</Th>
                        <Th>Data término</Th>
                        <Th>Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>

                      {tasks.map((task) => (


                        <Tr key={task.id} >
                          <Td>
                            <Checkbox
                              onChange={() => markTask(task.id, task.completed)}
                              isChecked={task.completed ? true : null}>
                              {task.completed ? (
                                <Text as='s'>{task.description}</Text>
                              ) : (
                                task.description
                              )

                              }
                            </Checkbox>
                          </Td>
                          <Td>{task.timeline == 'start' ? <Progress hasStripe value={10} size='md' colorScheme='green' />
                            : task.timeline == 'middle' ? <Progress hasStripe value={50} size='md' colorScheme='yellow' />
                              : <Progress hasStripe value={100} size='md' colorScheme='red' />}</Td>
                          <Td>{format(new Date(parseISO(task.due_date)), 'dd/MM/yyyy', { locale: ptBR })}</Td>
                          <Td display="flex" gap="3">
                            <Link _hover={{ opacity: "0.7", transitionDuration: '0.2s' }} onClick={() => editHandleModal(task)} ><FiEdit size={20} color="#850C87" /></Link>
                            <Link _hover={{ opacity: "0.7", transitionDuration: '0.2s' }} onClick={() => deleteTask(task.id)} ><FiTrash2 size={20} color="#850C87" /></Link>
                          </Td>
                        </Tr>


                      )

                      )}
                    </Tbody>

                  </Table>
                </TableContainer>
                :
                <Box display="flex" p="5">
                  <Text color="#850C87"><strong>Não existem tarefas</strong></Text>
                </Box>
              }

            </Box>
          }
        </Flex>
      </Container >


    )
  }

  return <Login />





}
