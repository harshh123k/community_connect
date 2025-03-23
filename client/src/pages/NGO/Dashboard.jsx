import React, { useState, useEffect } from 'react';
import { url } from '../../Global/URL';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    useToast,
    Badge,
    Input,
    InputGroup,
    InputLeftElement,
    Stack,
    HStack,
    VStack,
    SimpleGrid
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        totalVolunteers: 0,
        pendingApprovals: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            
            if (!userInfo || !userInfo._id) {
                console.error('User information not found or invalid');
                return;
            }

            // Fetch projects
            const projectsResponse = await axios.get(`${url}/projects/ngo/${userInfo._id}`);
            setProjects(projectsResponse.data.projects || []);

            // Fetch volunteers
            const volunteersResponse = await axios.get(`${url}/volunteers/ngo/${userInfo._id}`);
            setVolunteers(volunteersResponse.data.volunteers || []);

            // Update statistics
            setStats({
                totalProjects: projectsResponse.data.projects?.length || 0,
                activeProjects: projectsResponse.data.projects?.filter(p => p.status === 'active').length || 0,
                totalVolunteers: volunteersResponse.data.volunteers?.length || 0,
                pendingApprovals: volunteersResponse.data.volunteers?.filter(v => v.status === 'pending').length || 0
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to fetch dashboard data',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = () => {
        navigate('/ngo/projects/create');
    };

    const handleRefreshData = () => {
        fetchData();
    };

    const filteredProjects = projects.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Welcome Section */}
                <Card bg="white" shadow="sm">
                    <CardBody>
                        <VStack spacing={2} align="stretch">
                            <Heading size="lg">Welcome to Your NGO Dashboard</Heading>
                            <Text color="gray.600">
                                Manage your projects, volunteers, and track your impact from one central location.
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Statistics Cards */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Card>
                        <CardBody>
                            <VStack align="start">
                                <Text color="gray.500">Total Projects</Text>
                                <Heading size="lg">{stats.totalProjects}</Heading>
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <VStack align="start">
                                <Text color="gray.500">Active Projects</Text>
                                <Heading size="lg">{stats.activeProjects}</Heading>
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <VStack align="start">
                                <Text color="gray.500">Total Volunteers</Text>
                                <Heading size="lg">{stats.totalVolunteers}</Heading>
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <VStack align="start">
                                <Text color="gray.500">Pending Approvals</Text>
                                <Heading size="lg">{stats.pendingApprovals}</Heading>
                            </VStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Projects Section */}
                <Card>
                    <CardHeader>
                        <HStack justify="space-between">
                            <Heading size="md">Your Projects</Heading>
                            <HStack>
                                <Button
                                    colorScheme="green"
                                    leftIcon={<AddIcon />}
                                    onClick={handleRefreshData}
                                >
                                    Refresh Data
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    leftIcon={<AddIcon />}
                                    onClick={handleCreateProject}
                                >
                                    Create New Project
                                </Button>
                            </HStack>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={4}>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.300" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>

                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Title</Th>
                                        <Th>Description</Th>
                                        <Th>Status</Th>
                                        <Th>Progress</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredProjects.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={5} textAlign="center">No projects found</Td>
                                        </Tr>
                                    ) : (
                                        filteredProjects.map((project) => (
                                            <Tr key={project._id}>
                                                <Td>{project.title}</Td>
                                                <Td>{project.description}</Td>
                                                <Td>
                                                    <Badge colorScheme={project.status === 'completed' ? 'green' : 'blue'}>
                                                        {project.status === 'completed' ? 'Completed' : 'Active'}
                                                    </Badge>
                                                </Td>
                                                <Td>{project.progress || 0}%</Td>
                                                <Td>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="blue"
                                                        onClick={() => navigate(`/ngo/projects/edit/${project._id}`)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))
                                    )}
                                </Tbody>
                            </Table>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Volunteer Applications */}
                <Card>
                    <CardHeader>
                        <HStack justify="space-between">
                            <Heading size="md">Volunteer Applications</Heading>
                            <Button
                                colorScheme="green"
                                leftIcon={<AddIcon />}
                                onClick={handleRefreshData}
                            >
                                Refresh Data
                            </Button>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th>Email</Th>
                                    <Th>Skills</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {volunteers.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={5} textAlign="center">No volunteer applications</Td>
                                    </Tr>
                                ) : (
                                    volunteers.map((volunteer) => (
                                        <Tr key={volunteer._id}>
                                            <Td>{volunteer.name}</Td>
                                            <Td>{volunteer.email}</Td>
                                            <Td>
                                                {volunteer.skills?.map((skill, index) => (
                                                    <Badge key={index} mr={1} colorScheme="blue">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </Td>
                                            <Td>
                                                <Badge colorScheme={volunteer.isApproved ? 'green' : 'yellow'}>
                                                    {volunteer.isApproved ? 'Approved' : 'Pending'}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                {!volunteer.isApproved && (
                                                    <HStack spacing={2}>
                                                        <Button size="sm" colorScheme="green">
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" colorScheme="red">
                                                            Reject
                                                        </Button>
                                                    </HStack>
                                                )}
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
};

export default Dashboard; 