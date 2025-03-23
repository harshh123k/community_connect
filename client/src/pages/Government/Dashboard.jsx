import React, { useState, useEffect } from 'react';
import { url } from '../../Global/URL';
import axios from 'axios';
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
    Select,
    Input,
    InputGroup,
    InputLeftElement,
    Stack,
    HStack,
    VStack,
    Spinner,
    SimpleGrid
} from '@chakra-ui/react';
import { SearchIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const GovernmentDashboard = () => {
    const [ngos, setNgos] = useState([]);
    const [stats, setStats] = useState({
        totalNgos: 0,
        pendingApprovals: 0,
        totalVolunteers: 0,
        activeProjects: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            console.log('Fetching NGO data from:', `${url}/ngo/all`);
            // Fetch NGOs
            const ngoResponse = await axios.get(`${url}/ngo/all`);
            console.log('NGO Response:', ngoResponse.data);
            const ngoData = ngoResponse.data.ngos || [];
            setNgos(ngoData);

            // Calculate statistics
            const pendingNgos = ngoData.filter(ngo => !ngo.isApproved);
            setStats({
                totalNgos: ngoData.length,
                pendingApprovals: pendingNgos.length,
                totalVolunteers: 0, // We'll implement this later
                activeProjects: 0 // We'll implement this later
            });

            // Log the data for debugging
            console.log('NGO Data:', ngoData);
        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message || 'Failed to fetch dashboard data',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveNGO = async (ngoId) => {
        try {
            const response = await axios.post(`${url}/approve-user`, {
                email: ngoId,
                userType: 'ngo'
            });

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'NGO approved successfully',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error('Error approving NGO:', error);
            toast({
                title: 'Error',
                description: 'Failed to approve NGO',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const filteredNgos = ngos.filter(ngo => {
        const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ngo.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'pending' && !ngo.isApproved) ||
                            (filterStatus === 'approved' && ngo.isApproved);
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Welcome Section */}
                <Card bg="white" shadow="md">
                    <CardBody>
                        <VStack spacing={2} align="stretch">
                            <Heading size="lg">Welcome to Your Government Dashboard</Heading>
                            <Text color="gray.600">Manage and oversee NGO activities from one central location.</Text>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Statistics Cards */}
                <SimpleGrid columns={4} spacing={6} width="100%">
                    <Card>
                        <CardBody>
                            <Stack spacing={2}>
                                <Text color="gray.500">Total NGOs</Text>
                                <Heading size="lg">{stats.totalNgos}</Heading>
                                <Box color="green.500">
                                    <FaArrowUp />
                                </Box>
                            </Stack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <Stack spacing={2}>
                                <Text color="gray.500">Pending Approvals</Text>
                                <Heading size="lg">{stats.pendingApprovals}</Heading>
                                <Box color="red.500">
                                    <FaArrowDown />
                                </Box>
                            </Stack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <Stack spacing={2}>
                                <Text color="gray.500">Total Volunteers</Text>
                                <Heading size="lg">{stats.totalVolunteers}</Heading>
                                <Box color="green.500">
                                    <FaArrowUp />
                                </Box>
                            </Stack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <Stack spacing={2}>
                                <Text color="gray.500">Active Projects</Text>
                                <Heading size="lg">{stats.activeProjects}</Heading>
                                <Box color="green.500">
                                    <FaArrowUp />
                                </Box>
                            </Stack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* NGO Management Card */}
                <Card width="100%">
                    <CardHeader>
                        <Heading size="md">NGO Management</Heading>
                    </CardHeader>
                    <CardBody>
                        <Stack spacing={4}>
                            <HStack>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <SearchIcon color="gray.300" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search NGOs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                                <Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All NGOs</option>
                                    <option value="pending">Pending Approval</option>
                                    <option value="approved">Approved</option>
                                </Select>
                            </HStack>

                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Email</Th>
                                        <Th>Registration Number</Th>
                                        <Th>Status</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredNgos.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={5} textAlign="center">
                                                No NGOs found
                                            </Td>
                                        </Tr>
                                    ) : (
                                        filteredNgos.map((ngo) => (
                                            <Tr key={ngo._id}>
                                                <Td>{ngo.name}</Td>
                                                <Td>{ngo.email}</Td>
                                                <Td>{ngo.registrationNumber || 'N/A'}</Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={ngo.isApproved ? 'green' : 'yellow'}
                                                        variant="solid"
                                                        px={2}
                                                        py={1}
                                                        borderRadius="full"
                                                        fontSize="sm"
                                                        fontWeight="medium"
                                                        textTransform="capitalize"
                                                        display="inline-flex"
                                                        alignItems="center"
                                                        gap={1}
                                                        boxShadow="sm"
                                                        _hover={{
                                                            boxShadow: "md",
                                                            transform: "translateY(-1px)",
                                                            transition: "all 0.2s"
                                                        }}
                                                        _active={{
                                                            transform: "translateY(0)",
                                                            boxShadow: "sm"
                                                        }}
                                                    >
                                                        {ngo.isApproved ? (
                                                            <>
                                                                <CheckIcon mr={1} />
                                                                Approved
                                                            </>
                                                        ) : (
                                                            <>
                                                                <WarningIcon mr={1} />
                                                                Pending
                                                            </>
                                                        )}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    {!ngo.isApproved && (
                                                        <Button
                                                            size="sm"
                                                            colorScheme="green"
                                                            leftIcon={<CheckIcon />}
                                                            onClick={() => handleApproveNGO(ngo.email)}
                                                            isLoading={isLoading}
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}
                                                </Td>
                                            </Tr>
                                        ))
                                    )}
                                </Tbody>
                            </Table>
                        </Stack>
                    </CardBody>
                </Card>

                {/* Recent Activity Card */}
                <Card width="100%">
                    <CardHeader>
                        <Heading size="md">Recent Activity</Heading>
                    </CardHeader>
                    <CardBody>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Activity</Th>
                                    <Th>Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td colSpan={3} textAlign="center">
                                        No recent activities
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
};

export default GovernmentDashboard; 