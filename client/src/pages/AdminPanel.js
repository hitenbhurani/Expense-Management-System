import React, { useState, useEffect } from "react";
import { 
  Table, 
  Card, 
  Button, 
  Modal, 
  message,
  Space,
  Typography,
  Tag,
  Tooltip,
  Input,
  Select,
  DatePicker,
  Row,
  Col
} from "antd";
import { 
  UserOutlined, 
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined
} from "@ant-design/icons";
import axios from "axios";
import Layout from "./../components/Layout/Layout";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminPanel = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailModalVisible, setIsUserDetailModalVisible] = useState(false);
  const [userTransactions, setUserTransactions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const safeDate = (iso) => {
    if (!iso) return 'Never';
    try { return new Date(iso).toLocaleString(); } catch (e) { return String(iso); }
  };

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== "admin") {
      message.error("Access denied. Admin privileges required.");
      window.location.href = "/";
    }
  }, [user]);

  // Main transactions table columns
  const transactionColumns = [
    {
      title: "User Info",
      key: "userInfo",
      render: (_, record) => (
        <div>
          <div><strong>{record.user?.name || 'Unknown'}</strong></div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.email || 'N/A'}</Text>
        </div>
      ),
      width: 150,
    },
    {
      title: "Asset Details",
      key: "assetDetails",
      render: (_, record) => (
        <div>
          <div><strong>{record.assetName}</strong></div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.assetType}</Text>
        </div>
      ),
      width: 150,
    },
    {
      title: "Transaction Type",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (type) => (
        <Tag color={type === 'BUY' ? 'green' : type === 'SELL' ? 'red' : 'blue'}>
          {type || 'HOLD'}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => qty?.toFixed(2) || '0.00',
      width: 100,
    },
    {
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      render: (price) => `₹${price?.toFixed(2) || '0.00'}`,
      width: 120,
    },
    {
      title: "Current Price",
      dataIndex: "currentPrice",
      key: "currentPrice",
      render: (price) => `₹${price?.toFixed(2) || '0.00'}`,
      width: 120,
    },
    {
      title: "Total Investment",
      key: "totalInvestment",
      render: (_, record) => {
        const investment = (record.quantity || 0) * (record.purchasePrice || 0);
        return `₹${investment.toFixed(2)}`;
      },
      width: 130,
    },
    {
      title: "Current Value",
      key: "currentValue",
      render: (_, record) => {
        const currentValue = (record.quantity || 0) * (record.currentPrice || 0);
        return `₹${currentValue.toFixed(2)}`;
      },
      width: 120,
    },
    {
      title: "Profit/Loss",
      key: "profitLoss",
      render: (_, record) => {
        const investment = (record.quantity || 0) * (record.purchasePrice || 0);
        const currentValue = (record.quantity || 0) * (record.currentPrice || 0);
        const profitLoss = currentValue - investment;
        const percentage = investment > 0 ? (profitLoss / investment) * 100 : 0;
        
        return (
          <div>
            <div className={profitLoss >= 0 ? 'pl-positive' : 'pl-negative'} style={{ fontWeight: 'bold' }}>
              {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toFixed(2)}
            </div>
            <div className={profitLoss >= 0 ? 'pl-positive' : 'pl-negative'} style={{ fontSize: '12px' }}>
              {profitLoss >= 0 ? '+' : ''}{percentage.toFixed(2)}%
            </div>
          </div>
        );
      },
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          'Active': 'green',
          'Sold': 'red',
          'Hold': 'orange'
        };
        return <Tag color={colors[status] || 'default'}>{status || 'Unknown'}</Tag>;
      },
      width: 100,
    },
    {
      title: "Transaction Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <div>
          <div>{date ? new Date(date).toLocaleDateString() : 'Unknown'}</div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {date ? new Date(date).toLocaleTimeString() : ''}
          </Text>
        </div>
      ),
      width: 120,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => date ? (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(date).toLocaleTimeString()}
          </Text>
        </div>
      ) : 'Never',
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View User Details">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewUserDetails(record)}
              size="small"
              type="primary"
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // No need to fetch users separately as we get user info with assets
      
      // Fetch all assets with user details
      const assetsResponse = await axios.get("/admin/assets");
      const assetsWithUsers = assetsResponse.data.assets;
      
      // Transform assets into transaction logs
      const transactions = assetsWithUsers.map(asset => ({
        ...asset,
        transactionType: asset.status === 'Sold' ? 'SELL' : asset.status === 'Active' ? 'BUY' : 'HOLD',
        updatedAt: asset.updatedAt || asset.createdAt
      }));
      
      setAllTransactions(transactions);
      
    } catch (error) {
      message.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewUserDetails = async (transaction) => {
    setSelectedUser(transaction.user);
    setIsUserDetailModalVisible(true);
    
    // Fetch user's specific transactions
    try {
      const userTransactions = allTransactions.filter(t => t.user?._id === transaction.user?._id);
      setUserTransactions(userTransactions);
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      setUserTransactions([]);
    }
  };

  const handleRefresh = () => {
    fetchData();
    message.success("Data refreshed successfully");
  };

  const handleExport = () => {
    // Simple CSV export functionality
  const csvData = allTransactions.map(transaction => ({
      'User Name': transaction.user?.name || 'Unknown',
      'User Email': transaction.user?.email || 'N/A',
      'Asset Name': transaction.assetName,
      'Asset Type': transaction.assetType,
      'Transaction Type': transaction.transactionType,
      'Quantity': transaction.quantity,
      'Purchase Price': transaction.purchasePrice,
      'Current Price': transaction.currentPrice,
      'Total Investment': (transaction.quantity || 0) * (transaction.purchasePrice || 0),
      'Current Value': (transaction.quantity || 0) * (transaction.currentPrice || 0),
      'Profit/Loss': ((transaction.quantity || 0) * (transaction.currentPrice || 0)) - ((transaction.quantity || 0) * (transaction.purchasePrice || 0)),
      'Status': transaction.status,
      'Transaction Date': safeDate(transaction.createdAt),
      'Last Updated': transaction.updatedAt ? safeDate(transaction.updatedAt) : 'Never'
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter transactions based on search and filters
  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = searchText === '' || 
      transaction.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.assetName?.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.assetType?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    const matchesDate = !filterDateRange || (
      new Date(transaction.createdAt) >= filterDateRange[0] &&
      new Date(transaction.createdAt) <= filterDateRange[1]
    );
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // total profit/loss for selected user's transactions
  const totalPL = userTransactions.reduce((sum, t) => {
    const investment = (t.quantity || 0) * (t.purchasePrice || 0);
    const currentValue = (t.quantity || 0) * (t.currentPrice || 0);
    return sum + (currentValue - investment);
  }, 0);

  return (
    <Layout>
      <div style={{ padding: '24px', background: 'var(--bg)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: 'var(--primary)' }}>
              <UserOutlined /> Admin Panel - Transaction Logs
            </Title>
            <Text type="secondary">Detailed user transaction information and analytics</Text>
          </div>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              type="primary"
            >
              Export CSV
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Input
                placeholder="Search users, assets, or emails..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={4}>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
              >
                <Option value="all">All Status</Option>
                <Option value="Active">Active</Option>
                <Option value="Sold">Sold</Option>
                <Option value="Hold">Hold</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <DatePicker.RangePicker
                value={filterDateRange}
                onChange={setFilterDateRange}
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Text type="secondary">
                Showing {filteredTransactions.length} of {allTransactions.length} transactions
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Main Transactions Table */}
        <Card>
          <Table
            columns={transactionColumns}
            dataSource={filteredTransactions}
            loading={loading}
            rowKey="_id"
            pagination={{ 
              pageSize: 20, 
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`
            }}
            scroll={{ x: 1500 }}
            size="small"
          />
        </Card>

        {/* User Details Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined style={{ color: '#228B22' }} />
              <span>User Details - {selectedUser?.name}</span>
            </div>
          }
          open={isUserDetailModalVisible}
          onCancel={() => setIsUserDetailModalVisible(false)}
          footer={null}
          width={1200}
        >
          {selectedUser && (
            <div>
              <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Card size="small" title="User Information">
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Name:</Text> {selectedUser.name}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Email:</Text> {selectedUser.email}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Role:</Text> <Tag color="blue">{selectedUser.role?.toUpperCase()}</Tag>
                    </div>
                    <div>
                      <Text strong>Joined:</Text> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" title="Portfolio Summary">
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Total Transactions:</Text> {userTransactions.length}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Active Assets:</Text> {userTransactions.filter(t => t.status === 'Active').length}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Sold Assets:</Text> {userTransactions.filter(t => t.status === 'Sold').length}
                    </div>
                    <div>
                      <Text strong>Total Investment:</Text> ₹{userTransactions.reduce((sum, t) => sum + ((t.quantity || 0) * (t.purchasePrice || 0)), 0).toFixed(2)}
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" title="Performance">
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Current Value:</Text> ₹{userTransactions.reduce((sum, t) => sum + ((t.quantity || 0) * (t.currentPrice || 0)), 0).toFixed(2)}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Total P&L:</Text>{' '}
                      <Text className={totalPL >= 0 ? 'pl-positive' : 'pl-negative'} style={{ fontWeight: 'bold', marginLeft: 8 }}>
                        ₹{totalPL.toFixed(2)}
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              <Card title="User Transaction History" size="small">
                <Table
                  dataSource={userTransactions}
                  columns={transactionColumns.filter(col => col.key !== 'userInfo' && col.key !== 'actions')}
                  pagination={{ pageSize: 10 }}
                  size="small"
                  scroll={{ x: 1000 }}
                />
              </Card>
              
              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button onClick={() => setIsUserDetailModalVisible(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminPanel;