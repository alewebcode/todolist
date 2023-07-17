import { useForm } from 'react-hook-form';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    Input,
    CircularProgress,
    Box

} from '@chakra-ui/react'


import { useEffect, useState } from 'react';
import router from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const schema = yup.object({
    description: yup.string().required('Informe a descrição'),
    due_date: yup.string().required('Informe a data'),
}).required();

type FormData = yup.InferType<typeof schema>;

interface ModalProps {
    isOpen: boolean,
    onClose: () => void,
    dataForm: IFormInput,
    user: string,
    updateTasks: (array: object) => void
}

interface IFormInput {
    id?: number;
    description: string;
    due_date: string;
}


export function ModalAction({ isOpen, onClose, dataForm, user, updateTasks }: ModalProps) {


    const { register, handleSubmit, setValue, reset, formState: { errors }, clearErrors } = useForm<IFormInput>({
        resolver: yupResolver(schema)
    });

    const [loading, setLoading] = useState(false)

    useEffect(() => {


        setValue('description', dataForm?.description)
        setValue('due_date', dataForm?.due_date)


        clearErrors()

    }, [dataForm])

    const onSubmit = (async (data) => {

        setLoading(true)
        if (dataForm?.id) {

            try {
                const res = await fetch('api/' + dataForm.id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
                if (res) {
                    const r = res.json().then((res) => {
                        res.data.id = dataForm.id
                        updateTasks(res.data)
                    })

                    setLoading(false)
                    onClose()
                    reset();
                }
            } catch (error) {
                return toast.error('Ocorreu um erro ao salvar!', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        } else {
            data.user = user
            try {
                const res = await fetch('api/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })



                if (res) {
                    const r = res.json().then((res) => {
                        updateTasks(res.data)
                    })

                    setLoading(false)
                    onClose()
                    reset()



                }
            } catch (error) {
                return toast.error('Ocorreu um erro ao salvar!', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }

        }



    })


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent p={5}>
                    <ModalBody>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <FormControl pt={2}>
                                <FormLabel>Descrição</FormLabel>
                                <Input {...register('description')} placeholder='Descrição' />
                                <p style={{ color: "red" }}>{errors.description?.message}</p>
                            </FormControl>
                            <FormControl pt={2}>
                                <FormLabel>Data término</FormLabel>

                                <Input type="date" {...register('due_date')} placeholder='Data término' />
                                <p style={{ color: "red" }}> {errors.due_date?.message}</p>

                            </FormControl>

                            <Box display="flex" justifyContent="center" mt="5">  {loading ? <CircularProgress isIndeterminate color='green.300' /> : ''}</Box>
                            <ModalFooter>

                                <Button onClick={onClose} mr={3}>Cancelar</Button>
                                <Button type="submit" bgColor="#850C87" color='#fff' _hover={{ bg: "#C41FC7", transitionDuration: '0.2s' }} >Salvar</Button>

                            </ModalFooter>

                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>

        </>
    )

}