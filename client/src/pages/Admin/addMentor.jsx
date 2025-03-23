  import React, { useCallback, useEffect, useState } from 'react';
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
      InputRightAddon,
      Stack,
      useDisclosure,
      Box,
      Select
  } from '@chakra-ui/react';
  import { useTheme } from '../../Global/ThemeContext';
  import { AddIcon } from '@chakra-ui/icons';
  import showToast from '../../Global/Toast';
  import { useToast } from '@chakra-ui/react';
  import { url } from '../../Global/URL';
  import axios from 'axios';
  import { getUserDetails } from '../../Global/authUtils';
  import Alert from '../../components/Alert/alert';

  //New code
  import { useDropzone } from 'react-dropzone';
  import * as XLSX from 'xlsx';
  //end

  const AddMentor = () => {
      const { isOpen, onOpen, onClose } = useDisclosure();
      const { theme: colors } = useTheme();
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [contactNo, setContactNo] = useState('');
      const [emailError, setEmailError] = useState('');
      const [contactNoError, setContactNoError] = useState('');
      const toast = useToast();
      const [department, setDepartment] = useState('');
      const firstField = React.useRef();
      const [user, setUser] = useState(false);
      const [showDataModal, setshowDataModal] = useState(false);

      //New added
      const [csvData, setCsvData] = useState([]);
      const [errors, setErrors] = useState([]);
      const [selectedFile, setSelectedFile] = useState(null);


      const onDrop = useCallback((acceptedFiles) => {
          const file = acceptedFiles[0];
          setSelectedFile(file); // Update the selected file state
        
          try {
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
              handleExcelFile(file);
            } else {
              throw new Error({ field: 'file', message: 'Invalid file type. Please upload an Excel (.xlsx) file.' });
            }
          } catch (error) {
            setErrors([{ field: 'file', message: 'Invalid file type. Please upload an Excel (.xlsx) file.' }]);
            console.error(error);
          }
        }, []);
        
        const handleExcelFile = (file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target.result;
        
            if (!file.name.endsWith('.xlsx')) {
              setErrors([{ field: 'file', message: 'Invalid file type. Please upload an Excel (.xlsx) file.' }]);
              console.error('Invalid file type. Please upload an Excel (.xlsx) file.');
              return;
            }
        
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
            const { filteredData, validationErrors } = filterColumns(jsonData);
            if (validationErrors.length === 0) {
              setCsvData(filteredData);
              setErrors([]);
              console.log('Parsed Excel Data:', filteredData); // Log the parsed data to the console
            } else {
              setErrors(validationErrors);
              console.error('Validation errors:', validationErrors); // Log validation errors to the console
            }
          };
          reader.readAsBinaryString(file);
        };

        const uploadExcel = async () => {
          try {
            const response = await axios.post(url + '/coordinator/add/mentors', { csvData, department: user.department });
            if (response.data.success) {
              showToast(toast, "Success", 'success', response.data.msg);
              setshowDataModal(false);
            } else {
              showToast(toast, "Error", 'error', response.data.msg);
              setshowDataModal(false);
            }
            setCsvData([]);
          } catch (error) {
            showToast(toast, "Error", 'error', "Something went Wrong");
            setshowDataModal(false);
          }
        }

        const downloadTemplate = async () => {
          try {
            const response = await axios.get(url + '/download-template', {
              responseType: 'blob' // Specify the response type as blob
            });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', 'faculty-upload-template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          } catch (error) {
            showToast(toast, "Error", 'error', "Something went Wrong");
          }
        };

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
          }
        });

        const filterColumns = (data) => {
          const uniqueErrors = new Set();
      
          const filteredData = data.map((row, index) => {
              const errors = [];
      
              // Validate name
              if (!row.name || row.name.trim() === '') {
                  errors.push({ field: 'name', message: `Name is required for row ${index + 1}` });
              }
      
              // Validate email domain
              const emailRegex = /^[^\s@]+@somaiya\.edu$/i;
              if (!row.email || !emailRegex.test(row.email)) {
                  errors.push({ field: 'email', message: `Invalid or missing email for row ${index + 1}. It should be of @somaiya.edu domain.` });
              }
      
              // Validate contact number length
              const contactNoRegex = /^\d{10}$/;
              if (!row.contact_no || !contactNoRegex.test(row.contact_no)) {
                  errors.push({ field: 'contact_no', message: `Invalid or missing contact number for row ${index + 1}. It should be 10 digits long.` });
              }
      
              if (errors.length > 0) {
                  errors.forEach((error) => {
                      uniqueErrors.add(JSON.stringify(error));
                  });
                  return null;
              }
      
              return {
                  name: row.name,
                  email: row.email,
                  contact_no: row.contact_no,
              };
          });
      
          const validationErrors = [...uniqueErrors].map((errorString) => JSON.parse(errorString));
      
          return {
              filteredData: filteredData.filter((row) => row !== null),
              validationErrors,
          };
      };
      

        //end

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

      const handleAddMentor = async () => {
          // if (name == ''){
          //     showToast(toast, "Error", 'error', "Name Cannot Be Empty");
          //     return
          // }

          if (validateEmail() && validateContactNo()) {
              console.log(name, email, contactNo);
              onClose();
              const current_user = await getUserDetails();
              setUser(current_user)
              try {

                  const response = await axios.post(url + '/coordinator/add/mentor', { name, email, contact_no: contactNo.toString(), department });
                  console.log(response.data)
                  if (response.data.success) {
                      showToast(toast, "Success", 'success', "Mentor Registered Successfully");
                  } else {
                      showToast(toast, "Warning", 'info', "Mentor Already Exist");
                  }
                  setEmail('');
                  setName('');
                  setContactNo('');
              } catch (error) {
                  showToast(toast, "Error", 'error', "Something Wen't Wrong !");
              }


          }
          else {
              if (!validateEmail()) {
                  showToast(toast, "Error", 'error', "Provide a valid Somaiya Email");
              } else if (!validateContactNo()) {
                  showToast(toast, "Error", 'error', "Provide a valid Contact no.");
              }
          }

      };


      return (
          <>
              <Button ml={3} 
              // leftIcon={<AddIcon />} 
              color={colors.font} bg={colors.hover} onClick={onOpen}>
                  Add Mentor
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
                      <DrawerHeader borderBottomWidth='0px'>Add a Mentor</DrawerHeader>

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
                                      {/* <InputRightAddon>@somaiya.edu</InputRightAddon> */}
                                  </InputGroup>
                              </Box>

                              <Box>
                                  <FormLabel htmlFor='contactno'>Contact No.</FormLabel>
                                  <Input
                                      ref={firstField}
                                      type='tel'
                                      id='contactno'
                                      placeholder='Contact no.'
                                      value={contactNo}
                                      onChange={(e) => setContactNo(e.target.value)}
                                  />
                              </Box>
                              <Box>
                                  <FormLabel htmlFor='department'>Department</FormLabel>
                                  <Select
                                      id='department'
                                      placeholder='Select Department'
                                      value={department}
                                      onChange={(e) => setDepartment(e.target.value)}>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} selected disabled>Select Department</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Computer Engineering">COMPS</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Information Technology">IT</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Mechanical Engineering">MECH</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Electronics And Telecommunication Engineering">EXTC</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Electronics Engineering">ETRX</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Electronics And Computer Engineering" hidden>EXCP</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Robotics And Artificial Intelligence" hidden>RAI</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Artificial Intelligence And Data Science" hidden>AIDS</option>
                                          <option style={{backgroundColor: colors.secondary, color: colors.font}} value="Computer And Communication Engineering" hidden>CCE</option>
                                  </Select>
                              </Box>

                              {/* New code */}

                              <Box>
                              <div
                                  {...getRootProps()}
                                  className={`dropzone ${isDragActive ? 'active' : ''}`}
                                  style={{
                                      border: '2px dashed #ccc',
                                      borderRadius: '4px',
                                      padding: '20px',
                                      textAlign: 'center',
                                      cursor: 'pointer',
                                  }}
                                  >
                                  <input {...getInputProps()} />
                                  {selectedFile ? (
                                      <p>Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                                  ) : (
                                      <p>Drag & drop your Excel (.xlsx) file here, or click to select one</p>
                                  )}

                                  {errors.length > 0 && (
                                      <div style={{ color: 'red', marginTop: '10px' }}>
                                      <p>The following errors were found:</p>
                                      {errors.map((error, index) => (
                                          <p key={index}>{`${error.field} : ${error.message}`}</p>
                                      ))}
                                      </div>
                                  )}
                                  </div>

                                  {showDataModal && (
                                  <Alert
                                      onConfirm={uploadExcel}
                                      text={'Upload Excel'}
                                      onClose={() => setshowDataModal(false)}
                                  />
                                  )}

                                  {errors.length === 0 && (
                                  <button onClick={() => setshowDataModal(true)} style={{ width: '100%', height: '30px', marginTop: '20px', backgroundColor: '#b4f7ab', borderRadius: '15px' }}>Upload Excel</button>
                                  )}

                                  <button onClick={downloadTemplate} style={{ width: '100%', height: '30px', marginTop: '20px', backgroundColor: '#b4f7ab', borderRadius: '15px' }}>Download Template</button>

                              </Box>

                              {/* End  */}
                          </Stack>
                      </DrawerBody>

                      <DrawerFooter borderTopWidth='0px'>
                          <Button variant='outline' mr={3} onClick={onClose} color={colors.font} bg={colors.hover}>
                              Cancel
                          </Button>
                          {showDataModal && (
                          <Alert
                          onConfirm={handleAddMentor}
                          text={'Add mentor'}
                          onClosec={() => setshowDataModal(false)}

                          />)
                          }
                          <Button colorScheme='blue' onClick={()=>setshowDataModal(true)} color={colors.secondary} bg={colors.primary}>
                              Add
                          </Button>
                      </DrawerFooter>
                  </DrawerContent>
              </Drawer>
          </>
      );
  };

  export default AddMentor;