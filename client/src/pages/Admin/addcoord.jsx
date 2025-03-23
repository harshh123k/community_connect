import React, { useEffect, useState } from 'react';
import {
    Button,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    FormLabel,
    Input,
    InputGroup,
    Stack,
    useDisclosure,
    Box,
    Select,
    useToast
} from '@chakra-ui/react';
import { useTheme } from '../../Global/ThemeContext';
import { AddIcon } from '@chakra-ui/icons';
import showToast from '../../Global/Toast';
import { url } from '../../Global/URL';
import axios from 'axios';
import { getUserDetails } from '../../Global/authUtils';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const RegisterCoord = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { theme: colors } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [department, setDepartment] = useState('');
    const [emailError, setEmailError] = useState('');
    const [contactNoError, setContactNoError] = useState('');
    const toast = useToast();
    const firstField = React.useRef();
    const [user, setUser] = useState(false);
    const [uploadedData, setUploadedData] = useState([]);

    // Validate email and contact number
    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@somaiya\.edu$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email format');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validateContactNo = () => {
        const contactNoRegex = /^[0-9]{10}$/;
        if (!contactNoRegex.test(contactNo)) {
            setContactNoError('Invalid contact number');
            return false;
        }
        setContactNoError('');
        return true;
    };

    // Handle adding a coordinator
    const handleAddCoord = async () => {
        if (validateEmail() && validateContactNo()) {
            const current_user = await getUserDetails();
            setUser(current_user);
            try {
                const response = await axios.post(url + '/admin/add/coordinator', {
                    name,
                    email,
                    contact_no: contactNo.toString(),
                    department,
                });
                if (response.data.success) {
                    showToast(toast, "Success", 'success', "Coordinator Registered Successfully");
                } else {
                    showToast(toast, "Warning", 'info', "Coordinator Already Exists");
                }
            } catch (error) {
                showToast(toast, "Error", 'error', "Something Went Wrong !");
            }
        } else {
            if (!validateEmail()) {
                showToast(toast, "Error", 'error', "Provide a valid Somaiya Email");
            } else if (!validateContactNo()) {
                showToast(toast, "Error", 'error', "Provide a valid Contact no.");
            }
        }
    };

    // Handle file drop
    const handleDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            setUploadedData(jsonData); // Store the uploaded data for processing
            console.log(jsonData); // Display data in console for debugging
            showToast(toast, "Success", 'success', "File uploaded successfully");
        };
        reader.readAsArrayBuffer(file);
    };

    // Download the template
    const downloadTemplate = () => {
        const templateData = [
            ["Name", "Email", "Contact No.", "Department"],
            ["", "", "", ""], // Example empty row for user to fill out
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, "coordinator_template.xlsx");
    };

    // Configure dropzone
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        }
    });

    return (
        <>
            <Button leftIcon={<AddIcon />} color={colors.font} bg={colors.hover} onClick={onOpen}>
                Add Coordinator
            </Button>
            <Drawer
                isOpen={isOpen}
                placement='right'
                initialFocusRef={firstField}
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent color={colors.font} bg={colors.secondary}>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth='0px'>Add a Coordinator</DrawerHeader>

                    <DrawerBody>
                        <Stack spacing='24px'>
                            <Box>
                                <FormLabel htmlFor='username'>Name</FormLabel>
                                <Input
                                    ref={firstField}
                                    id='username'
                                    placeholder='Name'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    isRequired
                                />
                            </Box>

                            <Box>
                                <FormLabel htmlFor='email'>E-Mail</FormLabel>
                                <InputGroup>
                                    <Input
                                        type='email'
                                        id='email'
                                        placeholder='Email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </InputGroup>
                                {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                            </Box>

                            <Box>
                                <FormLabel htmlFor='contactno'>Contact No.</FormLabel>
                                <Input
                                    type='tel'
                                    id='contactno'
                                    placeholder='Contact no.'
                                    value={contactNo}
                                    onChange={(e) => setContactNo(e.target.value)}
                                />
                                {contactNoError && <p style={{ color: 'red' }}>{contactNoError}</p>}
                            </Box>
                            <Box>
                                <FormLabel htmlFor='department'>Department</FormLabel>
                                <Select
                                    id='department'
                                    placeholder='Select Department'
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}>
                                    <option style={{ backgroundColor: colors.secondary, color: colors.font }} value="Computer Engineering">COMPS</option>
                                    <option style={{ backgroundColor: colors.secondary, color: colors.font }} value="Information Technology">IT</option>
                                    <option style={{ backgroundColor: colors.secondary, color: colors.font }} value="Mechanical Engineering">MECH</option>
                                    <option style={{ backgroundColor: colors.secondary, color: colors.font }} value="Electronics & Telecommunication Engineering">EXTC</option>
                                    <option style={{ backgroundColor: colors.secondary, color: colors.font }} value="Electronics Engineering">ETRX</option>
                                </Select>
                            </Box>

                            {/* Drag and Drop Area */}
                            <Box
                                {...getRootProps()}
                                border="2px dashed"
                                borderColor={colors.font}
                                p={4}
                                borderRadius="md"
                                textAlign="center"
                                bg={colors.secondary}
                                color={colors.font}
                            >
                                <input {...getInputProps()} />
                                <p>Drag 'n' drop some files here, or click to select files</p>
                                <em>(Only *.xls and *.xlsx files will be accepted)</em>
                            </Box>
                           
                            {/* Download Template Button */}
                            <Button colorScheme='teal' onClick={downloadTemplate}>
                                Download Template
                            </Button>
                        </Stack>
                    </DrawerBody>

                    <DrawerFooter borderTopWidth='0px'>
                        <Button variant='outline' mr={3} onClick={onClose} color={colors.font} bg={colors.hover}>
                            Cancel
                        </Button>
                        <Button colorScheme='blue' onClick={handleAddCoord} color={colors.secondary} bg={colors.primary}>
                            Add
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default RegisterCoord;