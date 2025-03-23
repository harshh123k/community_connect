import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    CardHeader,
    SimpleGrid,
    Badge,
    Button,
    useToast,
    Spinner,
    Divider,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Progress
} from '@chakra-ui/react';
import { FaUser, FaBuilding, FaCalendarAlt, FaMapMarkerAlt, FaHandHoldingHeart, FaProjectDiagram, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { url } from '../../Global/URL';

const VolunteerDashboard = () => {
    const [volunteerData, setVolunteerData] = useState(null);
    const [projects, setProjects] = useState({
        active: [],
        completed: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo || !userInfo._id) {
                    throw new Error('No user information found');
                }

                // Use _id instead of id
                const response = await axios.get(`${url}/volunteers/${userInfo._id}`);
                console.log('Volunteer response:', response.data);
                if (response.data.success) {
                    setVolunteerData(response.data.data);
                    // Separate projects into active and completed
                    const activeProjs = response.data.data.projects?.filter(p => p.status === 'active') || [];
                    const completedProjs = response.data.data.projects?.filter(p => p.status === 'completed') || [];
                    setProjects({
                        active: activeProjs,
                        completed: completedProjs
                    });
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to fetch volunteer data');
                toast({
                    title: 'Error',
                    description: 'Failed to fetch your data. Please try logging in again.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
                <Spinner size="xl" />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <Text color="red.500" fontSize="xl">{error}</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Project Statistics */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card>
                        <CardHeader>
                            <HStack spacing={4}>
                                <FaProjectDiagram size={24} />
                                <Heading size="md">Active Projects</Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <Heading size="3xl" color="blue.500">
                                    {projects.active.length}
                                </Heading>
                                <Progress value={(projects.active.length / (projects.active.length + projects.completed.length)) * 100} colorScheme="blue" size="sm" />
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader>
                            <HStack spacing={4}>
                                <FaCheckCircle size={24} />
                                <Heading size="md">Completed Projects</Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <Heading size="3xl" color="green.500">
                                    {projects.completed.length}
                                </Heading>
                                <Progress value={(projects.completed.length / (projects.active.length + projects.completed.length)) * 100} colorScheme="green" size="sm" />
                            </VStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <HStack spacing={4}>
                            <FaUser size={24} />
                            <Heading size="md">Profile Information</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Box>
                                <Text fontWeight="bold">Name</Text>
                                <Text>{volunteerData?.name}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Email</Text>
                                <Text>{volunteerData?.email}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Phone</Text>
                                <Text>{volunteerData?.phone}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Address</Text>
                                <Text>{volunteerData?.address}</Text>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Projects List */}
                <Card>
                    <CardHeader>
                        <HStack spacing={4}>
                            <FaProjectDiagram size={24} />
                            <Heading size="md">My Projects</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Project Name</Th>
                                    <Th>NGO</Th>
                                    <Th>Start Date</Th>
                                    <Th>Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {[...projects.active, ...projects.completed].length === 0 ? (
                                    <Tr>
                                        <Td colSpan={4} textAlign="center">No projects found</Td>
                                    </Tr>
                                ) : (
                                    [...projects.active, ...projects.completed].map((project) => (
                                        <Tr key={project._id}>
                                            <Td>{project.name}</Td>
                                            <Td>{project.ngo?.name}</Td>
                                            <Td>{new Date(project.startDate).toLocaleDateString()}</Td>
                                            <Td>
                                                <Badge colorScheme={project.isCompleted ? 'green' : 'blue'}>
                                                    {project.isCompleted ? 'Completed' : 'Active'}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>

                {/* NGO Information */}
                <Card>
                    <CardHeader>
                        <HStack spacing={4}>
                            <FaBuilding size={24} />
                            <Heading size="md">NGO Information</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Box>
                                <Text fontWeight="bold">Organization</Text>
                                <Text>{volunteerData?.ngo?.name}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Status</Text>
                                <Badge colorScheme={volunteerData?.isApproved ? 'green' : 'yellow'}>
                                    {volunteerData?.isApproved ? 'Approved' : 'Pending Approval'}
                                </Badge>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Skills and Interests */}
                <Card>
                    <CardHeader>
                        <HStack spacing={4}>
                            <FaHandHoldingHeart size={24} />
                            <Heading size="md">Skills & Interests</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <Text fontWeight="bold">Skills</Text>
                                <HStack spacing={2} wrap="wrap" mt={2}>
                                    {volunteerData?.skills?.map((skill, index) => (
                                        <Badge key={index} colorScheme="blue">{skill}</Badge>
                                    ))}
                                </HStack>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Interests</Text>
                                <HStack spacing={2} wrap="wrap" mt={2}>
                                    {volunteerData?.interests?.map((interest, index) => (
                                        <Badge key={index} colorScheme="green">{interest}</Badge>
                                    ))}
                                </HStack>
                            </Box>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <Heading size="md">Actions</Heading>
                    </CardHeader>
                    <CardBody>
                        <HStack spacing={4}>
                            <Button colorScheme="blue" leftIcon={<FaCalendarAlt />}>
                                View Schedule
                            </Button>
                            <Button colorScheme="green" leftIcon={<FaMapMarkerAlt />}>
                                View Projects
                            </Button>
                        </HStack>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
};

export default VolunteerDashboard; 