import React, { useState, useEffect } from "react";
import { 
  Table, 
  Form, 
  Input, 
  Upload,
  Select, 
  Button, 
  Modal, 
  message, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tabs, 
  Progress, 
  Tag,
  Space,
  Tooltip,
  Typography,
  Divider,
  Badge,
  Alert,
  Spin,
  Timeline,
  List,
  Avatar,
  Rate,
  Switch,
  Slider,
  InputNumber,
  DatePicker,
  Calendar,
  Empty,
  Skeleton,
  Affix,
  BackTop
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  BarChartOutlined, 
  PieChartOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  TrophyOutlined,
  AimOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  SettingOutlined,
  BellOutlined,
  StarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  BookOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CrownOutlined,
  RocketOutlined,
  WalletOutlined,
  SafetyOutlined,
  TeamOutlined,
  GlobalOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  FilterOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  MoreOutlined,
  MenuOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  FundOutlined,
  StockOutlined,
  BankOutlined,
  GoldOutlined,
  HomeOutlined,
  CarOutlined,
  ShopOutlined,
  GiftOutlined,
  ExperimentOutlined,
  ApiOutlined,
  CloudOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  PrinterOutlined,
  SendOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  CommentOutlined,
  LikeOutlined,
  DislikeOutlined,
  FlagOutlined,
  TagsOutlined,
  TagOutlined,
  BarcodeOutlined,
  QrcodeOutlined,
  ScanOutlined,
  CameraOutlined,
  PictureOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileOutlined,
  UploadOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FolderAddOutlined,
  InboxOutlined,
  OutboxOutlined,
  CopyOutlined,
  ScissorOutlined,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import axios from "axios";
import Layout from "./../components/Layout/Layout";
import FileManagement from "../components/FileManagement";

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Theme palette (subtle, green-focused)
  const THEME = {
  pageBg: 'var(--bg)',
  cardBg: 'var(--card)',
  subtleCard: 'var(--muted-card)', 
  primary: '#2ecc71',     // Vibrant green
  accent: '#27ae60',      // Medium green
  success: '#32cd32',     // Lime green
  danger: '#e74c3c',      // Bright red
  muted: '#56606a',
  brightGreen: '#00e676', // Extra bright green for highlights
  darkGreen: '#1b5e20',   // Dark green for contrast
  lightGreen: '#b9f6ca'   // Light green for backgrounds
};

const HomePage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [form] = Form.useForm();
  const [analytics, setAnalytics] = useState({
    overview: {
      totalAssets: 0,
      totalInvestment: 0,
      totalCurrentValue: 0,
      totalProfitLoss: 0,
      overallReturnPercentage: 0,
      profitableAssets: 0,
      lossMakingAssets: 0,
    },
    assetTypeDistribution: {},
    topPerformers: [],
    worstPerformers: [],
    monthlyPerformance: [],
    riskMetrics: {}
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLocal, setNotificationsLocal] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recModalVisible, setRecModalVisible] = useState(false);
  const [recForSymbol, setRecForSymbol] = useState(null);
  const [recText, setRecText] = useState("");

  // Download handler for exporting portfolio data
  const handleDownload = () => {
    try {
      const exportData = {
        portfolio: {
          overview: analytics.overview,
          assets: assets.map(asset => ({
            name: asset.name,
            type: asset.type,
            quantity: asset.quantity,
            purchasePrice: asset.purchasePrice,
            currentPrice: asset.currentPrice,
            totalValue: asset.totalValue,
            investment: asset.investment,
            profitLoss: asset.profitLoss,
            profitLossPercentage: asset.profitLossPercentage,
            status: asset.status,
            purchaseDate: asset.purchaseDate
          }))
        },
        analytics: {
          assetTypeDistribution: analytics.assetTypeDistribution,
          topPerformers: analytics.topPerformers,
          worstPerformers: analytics.worstPerformers,
          monthlyPerformance: analytics.monthlyPerformance
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Portfolio data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export portfolio data');
    }
  };
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [reports, setReports] = useState({
    summary: null,
    performance: null,
    diversification: null,
    detailed: null
  });
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importUserIdInput, setImportUserIdInput] = useState('');
  const importResolverRef = React.useRef(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [goals, setGoals] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [investmentGoals, setInvestmentGoals] = useState({
    targetAmount: 0,
    currentAmount: 0,
    targetDate: null,
    monthlyContribution: 0
  });

  // helper: safe formatting to prevent calling methods on null/undefined
  const safeFormatNumber = (value, fallback = 0) => {
    const v = (value === null || value === undefined) ? fallback : value;
    try { return Number(v).toLocaleString(); } catch (e) { return String(v); }
  };

  const safeFormatDate = (iso) => {
    if (!iso) return 'Not Set';
    try { return new Date(iso).toLocaleString(); } catch (e) { return String(iso); }
  };
  const [riskProfile, setRiskProfile] = useState('Moderate');
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    autoRefresh: true,
    currency: 'INR'
  });

  // Active top-level tab (for styling)
  const [activeTab, setActiveTab] = useState('dashboard');

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch (e) { user = null; }

  // subtle card styles
  const minimalCardStyle = {
    background: THEME.cardBg,
    border: '1px solid #e8efe8',
    borderRadius: '8px',
    boxShadow: '0 6px 18px rgba(34,41,47,0.06)'
  };
  const subtleCardStyle = {
    background: THEME.subtleCard,
    border: '1px solid #e8efe8',
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(34,41,47,0.04)'
  };

  useEffect(() => {
    // load persisted small pieces from localStorage
    const storedNotifs = JSON.parse(localStorage.getItem('sms_notifications') || '[]');
    const storedRecs = JSON.parse(localStorage.getItem('sms_recommendations') || '[]');
    const storedGoals = JSON.parse(localStorage.getItem('sms_goals') || 'null');
    if (storedNotifs && storedNotifs.length) setNotificationsLocal(storedNotifs);
    if (storedRecs && storedRecs.length) setRecommendations(storedRecs);
    if (storedGoals) setInvestmentGoals(storedGoals);
  }, []);

  useEffect(() => {
    localStorage.setItem('sms_notifications', JSON.stringify(notificationsLocal));
  }, [notificationsLocal]);

  useEffect(() => {
    localStorage.setItem('sms_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem('sms_goals', JSON.stringify(investmentGoals));
  }, [investmentGoals]);

 

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const effectiveUserId = user?.userId || user?._id;
      
      if (!effectiveUserId) {
        message.error("User not authenticated");
        return;
      }

      // Fetch all assets
      const { data } = await axios.post("/api/v1/portfolio/get-all-assets", {
        userId: effectiveUserId,
      });

      // Enrich asset data with calculations
      const enriched = (data.assets || []).map(a => {
        const qty = Number(a.quantity || 0);
        const purchase = Number(a.purchasePrice || 0);
        const current = Number(a.currentPrice || 0);
        const totalValue = qty * current;
        const investment = qty * purchase;
        const profitLoss = totalValue - investment;
        const profitLossPercentage = investment > 0 ? (profitLoss / investment) * 100 : 0;
        return {
          ...a,
          totalValue,
          investment,
          profitLoss,
          profitLossPercentage,
          profitLossFormatted: profitLoss >= 0 
            ? `+₹${profitLoss.toFixed(2)}` 
            : `-₹${Math.abs(profitLoss).toFixed(2)}`,
          percentageFormatted: `${profitLoss >= 0 ? '+' : ''}${profitLossPercentage.toFixed(2)}%`
        };
      });

      // Update assets state
      setAssets(enriched);

      // Calculate type distribution and performance metrics
      const typeDistribution = enriched.reduce((acc, asset) => {
        const type = asset.type || 'Others';
        acc[type] = (acc[type] || 0) + (asset.totalValue || 0);
        return acc;
      }, {});

      const typePerformance = enriched.reduce((acc, asset) => {
        const type = asset.type || 'Others';
        if (!acc[type]) {
          acc[type] = {
            totalValue: 0,
            totalInvestment: 0,
            profitLoss: 0,
            count: 0
          };
        }
        acc[type].totalValue += asset.totalValue || 0;
        acc[type].totalInvestment += asset.investment || 0;
        acc[type].profitLoss += asset.profitLoss || 0;
        acc[type].count += 1;
        return acc;
      }, {});

      // Calculate monthly performance (last 6 months)
      const monthlyData = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthStr = month.toLocaleString('default', { month: 'short' });
        
        const value = enriched.reduce((sum, asset) => {
          const purchaseDate = new Date(asset.purchaseDate);
          return purchaseDate <= monthEnd ? sum + (asset.totalValue || 0) : sum;
        }, 0);
        
        monthlyData.push({ month: monthStr, value });
      }

      // Calculate overall metrics
      const uniqueTypes = Object.keys(typeDistribution).length;
      const profitableAssets = enriched.filter(a => (a.profitLoss || 0) > 0).length;
      const lossAssets = enriched.filter(a => (a.profitLoss || 0) < 0).length;
      const diversificationScore = Math.min(uniqueTypes * 20, 100);

      // Get top and worst performers
      const profits = enriched
        .filter(a => a.profitLoss > 0)
        .sort((x, y) => y.profitLoss - x.profitLoss)
        .slice(0, 5);

      const losses = enriched
        .filter(a => a.profitLoss < 0)
        .sort((x, y) => x.profitLoss - y.profitLoss)
        .slice(0, 5);

      // Update analytics state with all metrics
      const analytics = {
        overview: {
          totalValue: enriched.reduce((sum, asset) => sum + (asset.totalValue || 0), 0),
          totalInvestment: enriched.reduce((sum, asset) => sum + (asset.investment || 0), 0),
          totalProfitLoss: enriched.reduce((sum, asset) => sum + (asset.profitLoss || 0), 0),
          assetsCount: enriched.length
        },
        assetTypeDistribution: typeDistribution,
        assetTypePerformance: typePerformance,
        monthlyPerformance: monthlyData,
        topPerformers: profits,
        worstPerformers: losses,
        riskMetrics: {
          diversificationScore,
          profitableAssets,
          lossAssets,
          assetTypeCount: uniqueTypes,
          totalAssets: enriched.length
        }
      };
      
      setAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching assets:', error);
      message.error("Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  };

  // Load assets when component mounts
  useEffect(() => {
    fetchAssets();
    // run once on mount; further refreshes are manual or via Live toggle
  }, []);

  const handleAddAsset = () => {
    setEditingAsset(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    form.setFieldsValue({
      ...asset,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : undefined,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/portfolio/delete-asset/${id}`);
      message.success("Asset deleted successfully");
      fetchAssets();
    } catch (error) {
      message.error("Failed to delete asset");
    }
  };

  // Table columns (placed after handlers so callbacks are defined)
  const columns = [
    { title: 'Asset Name', dataIndex: 'assetName', key: 'assetName', sorter: (a,b) => a.assetName.localeCompare(b.assetName) },
    { title: 'Type', dataIndex: 'assetType', key: 'assetType', render: t => <Tag color="blue">{t}</Tag> },
    { 
      title: 'Quantity', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: q => `${parseFloat(q).toLocaleString()}`
    },
    { 
      title: 'Purchase Price', 
      dataIndex: 'purchasePrice', 
      key: 'purchasePrice', 
      render: p => `₹${parseFloat(p || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
    },
    { 
      title: 'Current Price', 
      dataIndex: 'currentPrice', 
      key: 'currentPrice', 
      render: p => `₹${parseFloat(p || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
    },
    { 
      title: 'Total Value', 
      key: 'totalValue', 
      render: (_, r) => {
        const qty = parseFloat(r.quantity);
        const cur = parseFloat(r.currentPrice);
        const total = (isNaN(qty) || isNaN(cur)) ? 0 : qty * cur;
        return `₹${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      }
    },
    { 
      title: 'P&L', 
      key: 'profitLoss', 
      render: (_, r) => {
        const qty = parseFloat(r.quantity);
        const pur = parseFloat(r.purchasePrice);
        const cur = parseFloat(r.currentPrice);
        const invest = (!isNaN(qty) && !isNaN(pur)) ? qty * pur : 0;
        const val = (!isNaN(qty) && !isNaN(cur)) ? qty * cur : 0;
        const pl = val - invest;
        const pct = invest > 0 ? (pl/invest) * 100 : 0;
        const cls = pl > 0 ? 'pl-positive' : pl < 0 ? 'pl-negative' : 'muted';
        return (
          <div>
            <div className={cls} style={{ fontWeight: 700 }}>
              {pl !== 0 ? `${pl > 0 ? '+' : '-'}₹${Math.abs(pl).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}
            </div>
            <div className={cls} style={{ fontSize: 12 }}>
              {invest > 0 ? `${pl >= 0 ? '+' : ''}${Math.abs(pct).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%` : '-'}
            </div>
          </div>
        );
      }},
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={s==='Active'?'green': s==='Sold'?'red':'orange'}>{s}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, r) => (<Space><Tooltip title="Edit"><Button type="primary" icon={<EditOutlined />} size="small" onClick={()=>handleEdit(r)} /></Tooltip><Tooltip title="Delete"><Button danger icon={<DeleteOutlined />} size="small" onClick={()=>handleDelete(r._id)} /></Tooltip></Space>) }
  ];

  const handleSubmit = async (values) => {
    try {
      // Validate numeric fields and convert to numbers
      const quantity = parseFloat(values.quantity);
      const purchasePrice = parseFloat(values.purchasePrice);
      const currentPrice = parseFloat(values.currentPrice);

      if (isNaN(quantity) || quantity <= 0) {
        message.error("Please enter a valid quantity");
        return;
      }
      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        message.error("Please enter a valid purchase price");
        return;
      }
      if (isNaN(currentPrice) || currentPrice <= 0) {
        message.error("Please enter a valid current price");
        return;
      }

      const payload = {
        ...values,
        userId: user?.userId || user?._id,
        quantity,
        purchasePrice,
        currentPrice,
        purchaseDate: values.purchaseDate || new Date().toISOString().split('T')[0]
      };

      if (editingAsset) {
        await axios.put(`/api/v1/portfolio/update-asset/${editingAsset._id}`, payload);
        message.success("Asset updated successfully");
      } else {
        await axios.post("/api/v1/portfolio/add-asset", payload);
        message.success("Asset added successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchAssets();
    } catch (error) {
      console.error("Save error:", error);
      message.error(error.response?.data?.error || error.response?.data?.message || "Failed to save asset. Please try again.");
    }
  };

  const generateReport = async (reportType) => {
    try {
      if (!user || !user._id) {
        message.error('User not authenticated');
        return;
      }
      const { data } = await axios.post("/portfolio/get-portfolio-report", {
        userId: user._id,
        reportType,
      });
      
      setCurrentReport({ type: reportType, data: data.reportData });
      setReports(prev => ({ ...prev, [reportType]: data.reportData }));
      setIsReportModalVisible(true);
      message.success(`${reportType} report generated successfully`);
    } catch (error) {
      message.error("Failed to generate report");
    }
  };

  // Real-time data simulation - Improved with actual price updates
  useEffect(() => {
    if (isRealTimeEnabled) {
      const interval = setInterval(async () => {
        try {
          // Fetch fresh data from server instead of just simulating
          await fetchAssets();
          message.success('Portfolio data refreshed', 1);
        } catch (error) {
          console.error('Failed to refresh data:', error);
        }
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isRealTimeEnabled]);

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
    message.info(`Real-time updates ${!isRealTimeEnabled ? 'enabled' : 'disabled'}`);
    // push a small notification
    const notif = { title: 'Real-time toggled', body: `Real-time updates ${!isRealTimeEnabled ? 'enabled' : 'disabled'}`, date: new Date().toISOString() };
    setNotificationsLocal(prev => [notif, ...prev]);
  };

  return (
    <Layout>
      <div style={{ 
        padding: '24px', 
        background: THEME.pageBg,
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Minimal Header */}
        <div style={{ 
          marginBottom: '24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: THEME.cardBg,
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #e8e8e8'
        }}>
            <div>
            <Title level={1} style={{ color: THEME.muted, margin: 0, fontSize: '2.5rem' }}>
              <DashboardOutlined /> Smart Portfolio Dashboard
            </Title>
            <Text style={{ color: THEME.muted, fontSize: '1.1rem' }}>
              Advanced Investment Management & Analytics Platform
            </Text>
          </div>
          <Space size="middle">
            <Badge 
              status={isRealTimeEnabled ? "processing" : "default"} 
              text={isRealTimeEnabled ? "Live" : "Static"}
            />
            <Button 
              type="default"
              icon={<SyncOutlined spin={isRealTimeEnabled} />}
              onClick={toggleRealTime}
            >
              {isRealTimeEnabled ? "Live" : "Static"}
            </Button>
            <Button 
              icon={<BellOutlined />}
              onClick={() => setShowNotifications(true)}
            >
              Notifications
            </Button>
            <Button 
              icon={<SettingOutlined />}
            >
              Settings
            </Button>
          </Space>
        </div>

        {/* Portfolio Overview Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={minimalCardStyle}>
              <Statistic
                title={<span style={{ color: THEME.muted }}>Portfolio Value</span>}
                value={analytics.overview.totalCurrentValue}
                prefix="₹"
                valueStyle={{ color: THEME.primary }}
                icon={<DollarOutlined style={{ color: THEME.primary }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={minimalCardStyle}>
              <Statistic
                title={<span style={{ color: THEME.muted }}>Total Investment</span>}
                value={analytics.overview.totalInvestment}
                prefix="₹"
                valueStyle={{ color: THEME.muted }}
                icon={<BarChartOutlined style={{ color: THEME.muted }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={minimalCardStyle}>
              <Statistic
                title={<span style={{ color: THEME.muted }}>Total P&L</span>}
                value={analytics.overview.totalProfitLoss}
                prefix="₹"
                valueStyle={{ color: analytics.overview.totalProfitLoss >= 0 ? THEME.success : THEME.danger }}
                icon={analytics.overview.totalProfitLoss >= 0 ? <RiseOutlined style={{ color: THEME.success }} /> : <FallOutlined style={{ color: THEME.danger }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={subtleCardStyle}>
              <Statistic
                title={<span style={{ color: THEME.muted }}>Return %</span>}
                value={analytics.overview.overallReturnPercentage}
                suffix="%"
                precision={2}
                valueStyle={{ color: analytics.overview.overallReturnPercentage >= 0 ? THEME.success : THEME.danger }}
                icon={analytics.overview.overallReturnPercentage >= 0 ? <RiseOutlined style={{ color: THEME.success }} /> : <FallOutlined style={{ color: THEME.danger }} />}
              />
            </Card>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          type="card"
          tabBarGutter={20}
          tabBarStyle={{ background: THEME.subtleCard, borderRadius: '10px', padding: '6px' }}
          style={{
            background: THEME.cardBg,
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0'
          }}
        >
          <TabPane 
            tab={
              <span style={{ color: activeTab === 'dashboard' ? THEME.primary : THEME.muted, fontWeight: '600', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <DashboardOutlined style={{ color: activeTab === 'dashboard' ? THEME.primary : THEME.muted }} /> Dashboard
              </span>
            } 
            key="dashboard"
          >
            {/* Enhanced Dashboard Content */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card 
                  title={<span style={{ fontSize: '20px', fontWeight: '600' }}>Portfolio Overview</span>}
                  style={{ ...minimalCardStyle, borderRadius: '12px' }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Card 
                        size="small"
                        style={{ 
                          borderRadius: '12px',
                          textAlign: 'center'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: THEME.muted }}>Total Value</span>}
                          value={analytics.overview.totalCurrentValue}
                          prefix="₹"
                          valueStyle={{ color: THEME.muted, fontSize: '24px' }}
                          icon={<WalletOutlined style={{ color: 'var(--muted)' }} />}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card 
                        size="small"
                        style={{ 
                          borderRadius: '12px',
                          textAlign: 'center'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: THEME.muted }}>Investment</span>}
                          value={analytics.overview.totalInvestment}
                          prefix="₹"
                          valueStyle={{ color: THEME.muted, fontSize: '24px' }}
                          icon={<FundOutlined style={{ color: 'var(--muted)' }} />}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card 
                        size="small"
                        style={{ 
                          borderRadius: '12px',
                          textAlign: 'center'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: THEME.muted }}>P&L</span>}
                          value={analytics.overview.totalProfitLoss}
                          prefix="₹"
                          valueStyle={{ color: analytics.overview.totalProfitLoss >= 0 ? THEME.success : THEME.danger, fontSize: '24px' }}
                            icon={analytics.overview.totalProfitLoss >= 0 ? 
                              <RiseOutlined style={{ color: THEME.success }} /> : 
                              <FallOutlined style={{ color: THEME.danger }} />
                            }
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card 
                        size="small"
                        style={{ 
                          background: THEME.subtleCard,
                          border: 'none',
                          borderRadius: '12px',
                          textAlign: 'center'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: '#333' }}>Return %</span>}
                          value={analytics.overview.overallReturnPercentage}
                          suffix="%"
                          precision={2}
                          valueStyle={{ color: '#333', fontSize: '24px' }}
                          icon={<RiseOutlined style={{ color: THEME.accent }} />}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Quick Actions</span>} style={minimalCardStyle}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAsset} block>
                      Add Asset
                    </Button>
                    <Button icon={<BarChartOutlined />} onClick={() => generateReport('summary')} block>
                      Generate Report
                    </Button>
                    <Button icon={<DownloadOutlined />} onClick={handleDownload} block>
                      Export Data
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane 
            tab={
              <span style={{ color: activeTab === 'portfolio' ? THEME.primary : THEME.muted, fontWeight: '600', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <TrophyOutlined style={{ color: activeTab === 'portfolio' ? THEME.primary : THEME.muted }} /> Portfolio
              </span>
            } 
            key="portfolio"
            >
            <Card
              title="Asset Portfolio"
              style={{ borderRadius: '12px' }}
              extra={
                <Space>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddAsset}
                        style={{ 
                          background: 'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        Add Asset
                      </Button>
                </Space>
              }
            >
              <Table
                columns={columns}
                dataSource={assets}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
                style={{ borderRadius: '8px' }}
              />
            </Card>
          </TabPane>
          <TabPane 
            tab={
              <span style={{ color: activeTab === 'analytics' ? THEME.primary : THEME.muted, fontWeight: '600', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <BarChartOutlined style={{ color: activeTab === 'analytics' ? THEME.primary : THEME.muted }} /> Analytics
              </span>
            } 
            key="analytics"
            >
              <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card 
                  title="Asset Distribution" 
                  style={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    background: 'white'
                  }}
                >
                  {Object.keys(analytics.assetTypeDistribution || {}).length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(analytics.assetTypeDistribution || {})
                            .filter(([_, value]) => value > 0)
                            .map(([name, value]) => ({ 
                              name: name || 'Others', 
                              value: parseFloat(value.toFixed(2))
                            }))}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value, percent }) => 
                            `${name} (₹${value.toFixed(2)}, ${(percent * 100).toFixed(1)}%)`}
                          outerRadius={120}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.keys(analytics.assetTypeDistribution || {}).map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', 
                                '#E91E63', '#00BCD4', '#FF5722', '#795548'
                              ][index % 8]} 
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value, name) => [`₹${value.toFixed(2)}`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty 
                      description="No assets found" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    />
                  )}
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  title="Performance Overview" 
                  style={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    background: 'white'
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Profitable Assets"
                        value={analytics.overview.profitableAssets}
                        valueStyle={{ color: THEME.success }}
                        prefix={<RiseOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Loss Making Assets"
                        value={analytics.overview.lossMakingAssets}
                        valueStyle={{ color: THEME.danger }}
                        prefix={<FallOutlined />}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Diversification Score:</strong> {analytics.riskMetrics.diversificationScore || 0}/100
                    </div>
                    <Progress 
                      percent={analytics.riskMetrics.diversificationScore || 0} 
                      strokeColor={{
                        '0%': THEME.success,
                        '100%': 'var(--success)',
                      }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} lg={12}>
                <Card 
                  title="Portfolio Performance Trend" 
                  style={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    background: 'white'
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.monthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={THEME.success} 
                        fill="url(#colorGradient)" 
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={THEME.success} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={THEME.success} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  title="Asset Type Performance" 
                  style={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    background: 'white'
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(analytics.assetTypeDistribution).map(([name, value]) => ({ name, value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill={THEME.success} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} lg={12}>
                <Card title="Top Performers" extra={<Tag color={THEME.primary}>Best</Tag>} style={{ borderRadius: '12px' }}>
                  { (analytics.topPerformers || []).slice(0, 5).filter(a => a.profitLoss > 0).map((asset, index) => (
                    <div key={asset._id} style={{ 
                      padding: '12px 0', 
                      borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{asset.assetName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {asset.assetType} • ₹{asset.totalValue?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: THEME.success, fontWeight: 'bold' }}>
                          +{(asset.profitLossPercentage || 0).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '12px', color: THEME.success }}>
                          +₹{(asset.profitLoss || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="Worst Performers" extra={<Tag color={THEME.danger}>Worst</Tag>} style={{ borderRadius: '12px' }}>
                  {(analytics.worstPerformers || []).slice(0, 5).filter(a => a.profitLoss < 0).map((asset, index) => (
                    <div key={asset._id} style={{ 
                      padding: '12px 0', 
                      borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{asset.assetName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {asset.assetType} • ₹{asset.totalValue?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: THEME.danger, fontWeight: 'bold' }}>
                          {(asset.profitLossPercentage || 0).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '12px', color: THEME.danger }}>
                          -₹{Math.abs(asset.profitLoss || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>

            <Card title="Generate Reports" style={{ marginTop: 16, borderRadius: '12px' }}>
              <Space wrap>
                    <Button icon={<BarChartOutlined />} onClick={() => generateReport('summary')} style={{ background: THEME.primary, border: 'none', borderRadius: '8px', color: 'white' }}>Summary Report</Button>
                    <Button icon={<PieChartOutlined />} onClick={() => generateReport('performance')} style={{ background: THEME.success, border: 'none', borderRadius: '8px', color: 'white' }}>Performance Report</Button>
                    <Button icon={<LineChartOutlined />} onClick={() => generateReport('diversification')} style={{ background: THEME.primary, border: 'none', borderRadius: '8px', color: 'white' }}>Diversification Report</Button>
                    <Button icon={<DownloadOutlined />} onClick={() => generateReport('detailed')} type="primary" style={{ background: THEME.primary, border: 'none', borderRadius: '8px' }}>Detailed Report</Button>
              </Space>
            </Card>
          </TabPane>
          <TabPane 
            tab={
              <span style={{ color: activeTab === 'goals' ? THEME.primary : THEME.muted, fontWeight: '600', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <AimOutlined style={{ color: activeTab === 'goals' ? THEME.primary : THEME.muted }} /> Goals
              </span>
            } 
            key="goals"
            >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AimOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Investment Goals</span>
                    </div>
                  }
                  style={{ ...subtleCardStyle, borderRadius: '16px' }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Target Amount: ₹{safeFormatNumber(investmentGoals.targetAmount)}</Text>
                      <Progress 
                        percent={investmentGoals.targetAmount ? Math.min(100, Math.round((investmentGoals.currentAmount / investmentGoals.targetAmount) * 100)) : 0} 
                        strokeColor={{
                          '0%': '#667eea',
                          '100%': '#764ba2',
                        }}
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                    <div>
                      <Text strong>Monthly Contribution: ₹{safeFormatNumber(investmentGoals.monthlyContribution)}</Text>
                    </div>
                    <div>
                      <Text strong>Target Date: {investmentGoals.targetDate ? safeFormatDate(investmentGoals.targetDate) : 'Not Set'}</Text>
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setGoalModalVisible(true)}>
                      Set New Goal
                    </Button>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RocketOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Goal Progress</span>
                    </div>
                  }
                  style={{ ...subtleCardStyle, borderRadius: '16px' }}
                >
                  <Timeline>
                    <Timeline.Item color="green">
                      <Text strong>Goal 1: Emergency Fund</Text>
                      <br />
                      <Text type="secondary">Target: ₹1,00,000 | Current: ₹75,000</Text>
                      <Progress percent={75} size="small" />
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <Text strong>Goal 2: Retirement Fund</Text>
                      <br />
                      <Text type="secondary">Target: ₹50,00,000 | Current: ₹12,50,000</Text>
                      <Progress percent={25} size="small" />
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <Text strong>Goal 3: House Purchase</Text>
                      <br />
                      <Text type="secondary">Target: ₹1,00,00,000 | Current: ₹30,00,000</Text>
                      <Progress percent={30} size="small" />
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane 
            tab={
              <span style={{ color: activeTab === 'watchlist' ? THEME.primary : THEME.muted, fontWeight: '600', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <EyeOutlined style={{ color: activeTab === 'watchlist' ? THEME.primary : THEME.muted }} /> Watchlist
              </span>
            } 
            key="watchlist"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <StarOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Market Watchlist</span>
                    </div>
                  }
                  style={{ ...subtleCardStyle, borderRadius: '16px' }}
                >
                    <List
                    dataSource={[
                      { name: 'Apple Inc.', symbol: 'AAPL', price: 175.43, change: 2.34, changePercent: 1.35 },
                      { name: 'Tesla Inc.', symbol: 'TSLA', price: 248.50, change: -5.20, changePercent: -2.05 },
                      { name: 'Microsoft Corp.', symbol: 'MSFT', price: 378.85, change: 4.12, changePercent: 1.10 },
                      { name: 'Amazon.com Inc.', symbol: 'AMZN', price: 155.20, change: 1.85, changePercent: 1.21 },
                      { name: 'Google LLC', symbol: 'GOOGL', price: 142.56, change: -2.30, changePercent: -1.59 }
                    ]}
                    renderItem={(item) => (
                      <List.Item
                          actions={[
                          <Button type="link" icon={<StarOutlined />} />,
                          <Button type="link" icon={<PlusOutlined />} onClick={() => { setRecForSymbol(item.symbol); setRecModalVisible(true); }}>
                            Recommend
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar style={{ background: THEME.accent }}>{item.symbol.charAt(0)}</Avatar>}
                          title={<Text strong>{item.name}</Text>}
                          description={
                            <div>
                              <Text code>{item.symbol}</Text>
                              <Text style={{ marginLeft: '16px', fontSize: '18px', fontWeight: 'bold' }}>
                                ₹{item.price}
                              </Text>
                              <Text 
                                style={{ 
                                  marginLeft: '16px',
                                  color: item.change >= 0 ? 'var(--success)' : 'var(--danger)',
                                  fontWeight: 'bold'
                                }}
                              >
                                {item.change >= 0 ? '+' : ''}{item.change} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent}%)
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FireOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Market Trends</span>
                    </div>
                  }
                  style={{ ...subtleCardStyle, borderRadius: '16px' }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Nifty 50</Text>
                      <br />
                      <Text style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>
                        ₹19,425.35 <RiseOutlined />
                      </Text>
                    </div>
                    <div>
                      <Text strong>Sensex</Text>
                      <br />
                      <Text style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>
                        ₹65,201.15 <RiseOutlined />
                      </Text>
                    </div>
                    <div>
                      <Text strong>Gold</Text>
                      <br />
                      <Text style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--danger)' }}>
                        ₹62,450 <FallOutlined />
                      </Text>
                    </div>
                  </Space>
                </Card>
                <Card title="Recommendations" style={{ marginTop: 16, borderRadius: '8px' }}>
                  {recommendations.length === 0 ? (
                    <Empty description="No recommendations" />
                  ) : (
                    <List
                      dataSource={recommendations}
                      renderItem={(r) => (
                        <List.Item>
                          <List.Item.Meta title={`${r.symbol}`} description={`${r.text} — ${safeFormatDate(r.date)}`} />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane 
            tab={
              <span style={{ color: activeTab === 'insights' ? THEME.primary : THEME.muted, fontWeight: '600', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <BulbOutlined style={{ color: activeTab === 'insights' ? THEME.primary : THEME.muted }} /> Insights
              </span>
            } 
            key="insights"
            >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <BulbOutlined style={{ color: THEME.accent, fontSize: '20px' }} />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>AI Insights</span>
                    </div>
                  }
                  style={{ 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Alert
                      message="Portfolio Optimization"
                      description="Consider rebalancing your portfolio. Your current allocation shows 70% in stocks, which may be too aggressive for your risk profile."
                      type="warning"
                      showIcon
                    />
                    <Alert
                      message="Diversification Opportunity"
                      description="Adding international funds could improve your portfolio's risk-adjusted returns by 15-20%."
                      type="info"
                      showIcon
                    />
                    <Alert
                      message="Tax Optimization"
                      description="Consider harvesting tax losses to offset gains. You have ₹25,000 in unrealized losses that could be tax-advantaged."
                      type="success"
                      showIcon
                    />
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ThunderboltOutlined style={{ color: THEME.accent, fontSize: '20px' }} />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Market News</span>
                    </div>
                  }
                  style={{ 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  }}
                >
                  <List
                    dataSource={[
                      { title: 'RBI Maintains Repo Rate at 6.5%', time: '2 hours ago', type: 'important' },
                      { title: 'Tech Stocks Rally on AI Boom', time: '4 hours ago', type: 'positive' },
                      { title: 'Gold Prices Hit 3-Month High', time: '6 hours ago', type: 'neutral' },
                      { title: 'IPO Season: 5 Companies Set to Launch', time: '8 hours ago', type: 'opportunity' }
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={<Text strong>{item.title}</Text>}
                          description={
                            <div>
                              <Text type="secondary">{item.time}</Text>
                              <Tag 
                                color={item.type === 'important' ? 'red' : item.type === 'positive' ? 'green' : item.type === 'opportunity' ? 'blue' : 'default'}
                                style={{ marginLeft: '8px' }}
                              >
                                {item.type.toUpperCase()}
                              </Tag>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane 
            tab={
              <span style={{ color: activeTab === 'settings' ? THEME.primary : THEME.muted, fontWeight: '600', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <SettingOutlined style={{ color: activeTab === 'settings' ? THEME.primary : THEME.muted }} /> Settings
              </span>
            } 
            key="settings"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <SettingOutlined style={{ color: THEME.accent, fontSize: '20px' }} />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Preferences</span>
                    </div>
                  }
                  style={{ 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Risk Profile</Text>
                      <br />
                      <Select 
                        value={riskProfile} 
                        onChange={setRiskProfile}
                        style={{ width: '100%', marginTop: '8px' }}
                      >
                        <Option value="Conservative">Conservative</Option>
                        <Option value="Moderate">Moderate</Option>
                        <Option value="Aggressive">Aggressive</Option>
                      </Select>
                    </div>
                    <div>
                      <Text strong>Notifications</Text>
                      <br />
                      <Switch 
                        checked={preferences.notifications} 
                        onChange={(checked) => setPreferences({...preferences, notifications: checked})}
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                    <div>
                      <Text strong>Auto Refresh</Text>
                      <br />
                      <Switch 
                        checked={preferences.autoRefresh} 
                        onChange={(checked) => setPreferences({...preferences, autoRefresh: checked})}
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                    <div>
                      <Text strong>Currency</Text>
                      <br />
                      <Select 
                        value={preferences.currency} 
                        onChange={(value) => setPreferences({...preferences, currency: value})}
                        style={{ width: '100%', marginTop: '8px' }}
                      >
                        <Option value="INR">Indian Rupee (₹)</Option>
                        <Option value="USD">US Dollar ($)</Option>
                        <Option value="EUR">Euro (€)</Option>
                      </Select>
                    </div>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <SafetyOutlined style={{ color: THEME.accent, fontSize: '20px' }} />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Security</span>
                    </div>
                  }
                  style={{ 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Two-Factor Authentication</Text>
                      <br />
                      <Button type="primary" size="small" style={{ marginTop: '8px' }}>
                        Enable 2FA
                      </Button>
                    </div>
                    <div>
                      <Text strong>Login History</Text>
                      <br />
                      <Text type="secondary">Last login: Today at 2:30 PM</Text>
                      <br />
                      <Text type="secondary">IP Address: 192.168.1.100</Text>
                    </div>
                    <div>
                      <Text strong>Import Data (TXT)</Text>
                      <br />
                      {/* Upload component - accepts only .txt and posts to server S3 upload endpoint */}
                      <Upload
                        accept=".txt"
                        showUploadList={false}
                        customRequest={async ({ file, onSuccess, onError, onProgress }) => {
                          try {
                            let userIdToUse = user?._id;
                            if (!userIdToUse) {
                              // prompt for a user id via modal
                              const askForUserId = () => new Promise((resolve) => {
                                importResolverRef.current = resolve;
                                setImportModalVisible(true);
                              });

                              const provided = await askForUserId();
                              setImportModalVisible(false);
                              setImportUserIdInput('');
                              if (!provided) {
                                message.error('Import cancelled: user id required');
                                return onError(new Error('User id required'));
                              }
                              userIdToUse = provided;
                            }

                            // basic validation for .txt
                            const isTxt = (file.type === 'text/plain') || file.name.toLowerCase().endsWith('.txt');
                            if (!isTxt) {
                              message.error('Only .txt files are allowed');
                              return onError(new Error('Only .txt files are allowed'));
                            }

                            const form = new FormData();
                            form.append('userId', userIdToUse);
                            form.append('file', file);

                            const res = await axios.post('/api/v1/files/upload', form, {
                              headers: { 'Content-Type': 'multipart/form-data' },
                              onUploadProgress: (e) => {
                                if (onProgress && e.total) {
                                  onProgress({ percent: Math.round((e.loaded / e.total) * 100) });
                                }
                              }
                            });

                            message.success(res.data?.message || 'File imported successfully');
                            if (onSuccess) onSuccess(res.data);
                          } catch (err) {
                            console.error('Import failed:', err);
                            message.error(err.response?.data?.error || err.message || 'Import failed');
                            if (onError) onError(err);
                          }
                        }}
                      >
                        <Button icon={<UploadOutlined />} size="small" style={{ marginTop: '8px' }}>
                          Import All Data
                        </Button>
                      </Upload>

                      {/* Modal to collect a user id when not logged in */}
                      <Modal
                        title="Enter user identifier"
                        open={importModalVisible}
                        onCancel={() => {
                          setImportModalVisible(false);
                          if (importResolverRef.current) importResolverRef.current(null);
                        }}
                        onOk={() => {
                          const val = (importUserIdInput || '').trim();
                          if (!val) {
                            message.warning('Please enter a user id or name');
                            return;
                          }
                          if (importResolverRef.current) importResolverRef.current(val);
                        }}
                      >
                        <Input
                          placeholder="Enter user id or email (used to tag the import)"
                          value={importUserIdInput}
                          onChange={(e) => setImportUserIdInput(e.target.value)}
                          onPressEnter={() => {
                            const val = (importUserIdInput || '').trim();
                            if (!val) return message.warning('Please enter a user id or name');
                            if (importResolverRef.current) importResolverRef.current(val);
                          }}
                        />
                      </Modal>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          {/* File Management Tab */}
          <TabPane 
            tab={
              <span style={{ color: activeTab === 'files' ? THEME.primary : THEME.muted, fontWeight: '600', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FileOutlined style={{ color: activeTab === 'files' ? THEME.primary : THEME.muted }} /> Portfolio Reports
              </span>
            } 
            key="files"
          >
            <FileManagement />
          </TabPane>
        </Tabs>

        {/* Add/Edit Asset Modal */}
        <Modal
          title={editingAsset ? "Edit Asset" : "Add Asset"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="assetName"
                  label="Asset Name"
                  rules={[{ required: true, message: "Please enter asset name!" }]}
                >
                  <Input placeholder="e.g., Apple Inc." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="assetType"
                  label="Asset Type"
                  rules={[{ required: true, message: "Please select asset type!" }]}
                >
                  <Select placeholder="Select asset type">
                    <Option value="Stocks">Stocks</Option>
                    <Option value="Bonds">Bonds</Option>
                    <Option value="Real Estate">Real Estate</Option>
                    <Option value="Cryptocurrency">Cryptocurrency</Option>
                    <Option value="Commodities">Commodities</Option>
                    <Option value="Mutual Funds">Mutual Funds</Option>
                    <Option value="ETFs">ETFs</Option>
                    <Option value="Fixed Deposits">Fixed Deposits</Option>
                    <Option value="Gold">Gold</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter description!" }]}
            >
              <Input.TextArea placeholder="Brief description of the asset" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[{ required: true, message: "Please enter quantity!" }]}
                >
                  <Input type="number" placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="purchasePrice"
                  label="Purchase Price"
                  rules={[{ required: true, message: "Please enter purchase price!" }]}
                >
                  <Input type="number" placeholder="0.00" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="currentPrice"
                  label="Current Price"
                  rules={[{ required: true, message: "Please enter current price!" }]}
                >
                  <Input type="number" placeholder="0.00" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="purchaseDate"
                  label="Purchase Date"
                  rules={[{ required: true, message: "Please select purchase date!" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  initialValue="Active"
                >
                  <Select>
                    <Option value="Active">Active</Option>
                    <Option value="Hold">Hold</Option>
                    <Option value="Sold">Sold</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea placeholder="Additional notes (optional)" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {editingAsset ? "Update Asset" : "Add Asset"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Goal Modal */}
        <Modal
          title="Set Investment Goal"
          open={goalModalVisible}
          onCancel={() => setGoalModalVisible(false)}
          onOk={() => {
            // basic validation
            if (!investmentGoals.targetAmount || investmentGoals.targetAmount <= 0) {
              return message.warning('Enter a valid target amount');
            }
            setGoalModalVisible(false);
            message.success('Goal saved');
          }}
        >
          <Form layout="vertical">
            <Form.Item label="Target Amount">
              <InputNumber style={{ width: '100%' }} value={investmentGoals.targetAmount} onChange={(v) => setInvestmentGoals(prev => ({ ...prev, targetAmount: v }))} />
            </Form.Item>
            <Form.Item label="Current Amount">
              <InputNumber style={{ width: '100%' }} value={investmentGoals.currentAmount} onChange={(v) => setInvestmentGoals(prev => ({ ...prev, currentAmount: v }))} />
            </Form.Item>
            <Form.Item label="Monthly Contribution">
              <InputNumber style={{ width: '100%' }} value={investmentGoals.monthlyContribution} onChange={(v) => setInvestmentGoals(prev => ({ ...prev, monthlyContribution: v }))} />
            </Form.Item>
            <Form.Item label="Target Date">
              <Input type="date" value={investmentGoals.targetDate ? new Date(investmentGoals.targetDate).toISOString().split('T')[0] : ''} onChange={(e) => setInvestmentGoals(prev => ({ ...prev, targetDate: e.target.value }))} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Report Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChartOutlined style={{ color: THEME.success }} />
              <span>{currentReport?.type?.charAt(0).toUpperCase() + currentReport?.type?.slice(1)} Report</span>
            </div>
          }
          open={isReportModalVisible}
          onCancel={() => setIsReportModalVisible(false)}
          footer={null}
          width={900}
          style={{ top: 20 }}
          bodyStyle={{ 
            padding: '24px',
            background: 'white',
            borderRadius: '8px'
          }}
        >
          {currentReport && (
            <div>
              <Alert
                message="Report Generated Successfully"
                description={`${currentReport.type} report generated on ${safeFormatDate(currentReport?.data?.generatedAt || new Date().toISOString())}`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              {currentReport.type === 'summary' && currentReport.data && (
                <div>
                  <Title level={4} style={{ color: THEME.success, marginBottom: '20px' }}>
                    <DollarOutlined /> Portfolio Summary
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        style={{ 
                          background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.success} 100%)`,
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: 'white' }}>Portfolio Value</span>}
                          value={currentReport.data.portfolioValue || analytics.overview.totalCurrentValue}
                          prefix="₹"
                          valueStyle={{ color: 'white' }}
                          precision={2}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        style={{ 
                          background: `linear-gradient(135deg, ${THEME.success} 0%, var(--success) 100%)`,
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: 'white' }}>Total Investment</span>}
                          value={currentReport.data.totalInvestment || analytics.overview.totalInvestment}
                          prefix="₹"
                          valueStyle={{ color: 'white' }}
                          precision={2}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        style={{ 
                          background: currentReport.data.returnPercentage >= 0 
                            ? `linear-gradient(135deg, ${THEME.success} 0%, #90EE90 100%)`
                            : `linear-gradient(135deg, ${THEME.danger} 0%, #FF6347 100%)`,
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: 'white' }}>Return %</span>}
                          value={currentReport.data.returnPercentage || analytics.overview.overallReturnPercentage}
                          suffix="%"
                          valueStyle={{ color: 'white' }}
                          precision={2}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {currentReport.type === 'performance' && currentReport.data && (
                <div>
                  <Title level={4} style={{ color: THEME.success, marginBottom: '20px' }}>
                    <TrophyOutlined /> Performance Analysis
                  </Title>
                  
                  <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                    <Col span={12}>
                      <Card 
                        size="small" 
                        style={{ borderRadius: '8px' }}
                      >
                        <Statistic
                          title={<span style={{ color: THEME.muted }}>Best Performer</span>}
                          value={currentReport.data.bestPerformer?.assetName || analytics.topPerformers[0]?.assetName || 'N/A'}
                          valueStyle={{ color: THEME.muted, fontSize: '16px' }}
                        />
                        <div style={{ color: THEME.muted, fontSize: '12px' }}>
                          +{currentReport.data.bestPerformer?.profitLossPercentage?.toFixed(2) || analytics.topPerformers[0]?.profitLossPercentage?.toFixed(2) || '0.00'}%
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card 
                        size="small" 
                        style={{ borderRadius: '8px' }}
                      >
                        <Statistic
                          title={<span style={{ color: THEME.muted }}>Worst Performer</span>}
                          value={currentReport.data.worstPerformer?.assetName || analytics.worstPerformers[0]?.assetName || 'N/A'}
                          valueStyle={{ color: THEME.muted, fontSize: '16px' }}
                        />
                        <div style={{ color: THEME.muted, fontSize: '12px' }}>
                          {currentReport.data.worstPerformer?.profitLossPercentage?.toFixed(2) || analytics.worstPerformers[0]?.profitLossPercentage?.toFixed(2) || '0.00'}%
                        </div>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Card title="Asset Performance Details" style={{ borderRadius: '8px' }}>
                    <Table
                      dataSource={(currentReport.data.assets || assets).map((rec) => {
                        const quantity = Number(rec.quantity || 0);
                        const purchasePrice = Number(rec.purchasePrice || rec.purchasePrice || 0);
                        const currentPrice = Number(rec.currentPrice || rec.currentPrice || 0);
                        const investment = quantity * purchasePrice;
                        const currentValue = quantity * currentPrice;
                        const profitLoss = currentValue - investment;
                        const profitLossPercentage = investment > 0 ? (profitLoss / investment) * 100 : 0;
                        return { ...rec, investment, currentValue, profitLoss, profitLossPercentage };
                      })}
                      columns={[
                        { 
                          title: 'Asset', 
                          dataIndex: 'assetName', 
                          key: 'assetName',
                          render: (text) => <Text strong>{text}</Text>
                        },
                        { title: 'Type', dataIndex: 'assetType', key: 'assetType' },
                        { 
                          title: 'Investment', 
                          dataIndex: 'investment', 
                          key: 'investment', 
                          render: (val, record) => `₹${((record.quantity || 0) * (record.purchasePrice || 0)).toFixed(2)}` 
                        },
                        { 
                          title: 'Current Value', 
                          dataIndex: 'currentValue', 
                          key: 'currentValue', 
                          render: (val, record) => `₹${((record.quantity || 0) * (record.currentPrice || 0)).toFixed(2)}` 
                        },
                        { 
                          title: 'P&L', 
                          dataIndex: 'profitLoss', 
                          key: 'profitLoss', 
                          render: (val, record) => {
                            const investment = (record.quantity || 0) * (record.purchasePrice || 0);
                            const currentValue = (record.quantity || 0) * (record.currentPrice || 0);
                            const profitLoss = currentValue - investment;
                            return (
                              <Text style={{ color: profitLoss >= 0 ? THEME.success : THEME.danger }}>
                                  {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toFixed(2)}
                                </Text>
                            );
                          }
                        },
                        { 
                          title: 'Return %', 
                          dataIndex: 'profitLossPercentage', 
                          key: 'profitLossPercentage', 
                          render: (val, record) => {
                            const investment = (record.quantity || 0) * (record.purchasePrice || 0);
                            const currentValue = (record.quantity || 0) * (record.currentPrice || 0);
                            const profitLoss = currentValue - investment;
                            const percentage = investment > 0 ? (profitLoss / investment) * 100 : 0;
                            return (
                              <Text style={{ color: percentage >= 0 ? THEME.success : THEME.danger }}>
                                  {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                                </Text>
                            );
                          }
                        },
                      ]}
                      pagination={false}
                      size="small"
                      scroll={{ x: 600 }}
                    />
                  </Card>
                </div>
              )}

              {currentReport.type === 'diversification' && currentReport.data && (
                <div>
                  <Title level={4} style={{ color: THEME.success, marginBottom: '20px' }}>
                    <PieChartOutlined /> Diversification Analysis
                  </Title>
                  
                  <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                    <Col span={12}>
                      <Card 
                        size="small" 
                        style={{ 
                          background: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: 'white' }}>Diversification Score</span>}
                          value={currentReport.data.diversificationScore || analytics.riskMetrics.diversificationScore || 0}
                          suffix="/100"
                          valueStyle={{ color: 'white' }}
                        />
                        <Progress 
                          percent={currentReport.data.diversificationScore || analytics.riskMetrics.diversificationScore || 0} 
                          strokeColor={{
                            '0%': '#32CD32',
                            '100%': '#90EE90',
                          }}
                          style={{ marginTop: '8px' }}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card 
                        size="small" 
                        style={{ 
                          background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        <Statistic
                          title={<span style={{ color: 'white' }}>Asset Types</span>}
                          value={Object.keys(currentReport.data.distribution || analytics.assetTypeDistribution).length}
                          valueStyle={{ color: 'white' }}
                        />
                        <div style={{ color: 'white', fontSize: '12px', marginTop: '4px' }}>
                          Different asset categories
                        </div>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Card title="Asset Distribution" style={{ borderRadius: '8px', marginBottom: '16px' }}>
                    <Row gutter={[16, 16]}>
                      {Object.entries(currentReport.data.distribution || analytics.assetTypeDistribution).map(([type, data]) => (
                        <Col span={8} key={type}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                              <Text strong style={{ color: THEME.success }}>{type}</Text>
                            <div style={{ marginTop: '8px' }}>
                              <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                {data.count || data || 0}
                              </Text>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {data.value ? `₹${data.value.toFixed(2)}` : 'assets'}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                  
                  {currentReport.data.recommendations && currentReport.data.recommendations.length > 0 && (
                    <Card title="Recommendations" style={{ borderRadius: '8px' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {currentReport.data.recommendations.map((rec, index) => (
                          <li key={index} style={{ marginBottom: '8px', color: '#228B22' }}>
                            <Text>{rec}</Text>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

              {currentReport.type === 'detailed' && currentReport.data && (
                <div>
                  <Title level={4} style={{ color: '#228B22', marginBottom: '20px' }}>
                    <DownloadOutlined /> Detailed Portfolio Report
                  </Title>
                  <Tabs defaultActiveKey="summary">
                    <TabPane tab={<span><BarChartOutlined />Summary</span>} key="summary">
                      <Row gutter={[16, 16]}>
                        <Col span={8}>
                          <Card 
                            size="small" 
                            style={{ 
                              background: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                          >
                            <Statistic 
                              title={<span style={{ color: 'white' }}>Portfolio Value</span>} 
                              value={currentReport.data.summary?.portfolioValue || analytics.overview.totalCurrentValue} 
                              prefix="₹" 
                              valueStyle={{ color: 'white' }}
                              precision={2}
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card 
                            size="small" 
                            style={{ 
                              background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                          >
                            <Statistic 
                              title={<span style={{ color: 'white' }}>Total Investment</span>} 
                              value={currentReport.data.summary?.totalInvestment || analytics.overview.totalInvestment} 
                              prefix="₹" 
                              valueStyle={{ color: 'white' }}
                              precision={2}
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card 
                            size="small" 
                            style={{ 
                              background: (currentReport.data.summary?.returnPercentage || analytics.overview.overallReturnPercentage) >= 0 
                                ? 'linear-gradient(135deg, #32CD32 0%, #90EE90 100%)'
                                : 'linear-gradient(135deg, #DC143C 0%, #FF6347 100%)',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                          >
                            <Statistic 
                              title={<span style={{ color: 'white' }}>Return %</span>} 
                              value={currentReport.data.summary?.returnPercentage || analytics.overview.overallReturnPercentage} 
                              suffix="%" 
                              valueStyle={{ color: 'white' }}
                              precision={2}
                            />
                          </Card>
                        </Col>
                      </Row>
                      
                      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Total Assets" 
                              value={analytics.overview.totalAssets} 
                              valueStyle={{ color: '#228B22' }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Profitable Assets" 
                              value={analytics.overview.profitableAssets} 
                              valueStyle={{ color: '#32CD32' }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Loss Making Assets" 
                              value={analytics.overview.lossMakingAssets} 
                              valueStyle={{ color: '#DC143C' }}
                            />
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic 
                              title="Diversification Score" 
                              value={analytics.riskMetrics.diversificationScore || 0} 
                              suffix="/100"
                              valueStyle={{ color: '#228B22' }}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tab={<span><TrophyOutlined />Performance</span>} key="performance">
                      <Card title="Top Performers" style={{ marginBottom: '16px' }}>
                        {analytics.topPerformers.slice(0, 3).map((asset, index) => (
                          <div key={asset._id} style={{ 
                            padding: '12px 0', 
                            borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <Text strong>{asset.assetName}</Text>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {asset.assetType} • ₹{asset.totalValue?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <Text style={{ color: '#32CD32', fontWeight: 'bold' }}>
                                +{asset.profitLossPercentage?.toFixed(2) || '0.00'}%
                              </Text>
                            </div>
                          </div>
                        ))}
                      </Card>
                    </TabPane>
                    <TabPane tab={<span><PieChartOutlined />Diversification</span>} key="diversification">
                      <Card title="Asset Type Distribution">
                        <Row gutter={[16, 16]}>
                          {Object.entries(analytics.assetTypeDistribution).map(([type, count]) => (
                            <Col span={8} key={type}>
                              <Card size="small" style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: '#228B22' }}>{type}</Text>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '8px' }}>
                                  {count}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>assets</div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    </TabPane>
                  </Tabs>
                </div>
              )}

              <div style={{ 
                textAlign: 'right', 
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <Space>
                  <Button onClick={() => setIsReportModalVisible(false)}>
                    Close
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    style={{ 
                      background: 'var(--success)', 
                      borderColor: 'var(--success)' 
                    }}
                  >
                    Download PDF
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Modal>

        {/* Recommendation Modal */}
        <Modal
          title={recForSymbol ? `Add Recommendation for ${recForSymbol}` : 'Add Recommendation'}
          open={recModalVisible}
          onCancel={() => { setRecModalVisible(false); setRecText(''); setRecForSymbol(null); }}
          onOk={() => {
            if (!recText) return message.warning('Enter recommendation');
            const newRec = { symbol: recForSymbol, text: recText, date: new Date().toISOString() };
            setRecommendations(prev => [newRec, ...prev]);
            setRecModalVisible(false);
            setRecText('');
            message.success('Recommendation added');
          }}
        >
          <Input.TextArea rows={4} value={recText} onChange={(e) => setRecText(e.target.value)} />
        </Modal>

        {/* Notifications Modal */}
        <Modal
          title="Notifications"
          open={showNotifications}
          onCancel={() => setShowNotifications(false)}
          footer={null}
        >
          {notificationsLocal.length === 0 ? (
            <Empty description="No notifications" />
          ) : (
            <List
              dataSource={notificationsLocal}
              renderItem={(n) => (
                <List.Item>
                  <List.Item.Meta
                    title={n.title}
                    description={n.body}
                  />
                </List.Item>
              )}
            />
          )}
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button onClick={() => { setNotificationsLocal([]); message.success('Notifications cleared'); }}>Clear</Button>
          </div>
        </Modal>

        {/* Back to Top Button */}
        <BackTop>
          <div style={{
            height: 40,
            width: 40,
            lineHeight: '40px',
            borderRadius: 4,
            background: 'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
            color: '#fff',
            textAlign: 'center',
            fontSize: 14,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <RocketOutlined />
          </div>
        </BackTop>
      </div>
    </Layout>
  );
};

export default HomePage;
