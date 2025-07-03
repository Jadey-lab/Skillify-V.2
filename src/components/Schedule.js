import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Tabs, Button, Modal, Form, Input,
  DatePicker, TimePicker, Calendar, Tooltip, Select,
  Card, Statistic, Row, Col, Progress, Checkbox
} from 'antd';
import { DownloadOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { db, auth } from './firebaseConfig';
import {
  collection, addDoc, onSnapshot, query,
  where, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import emailjs from 'emailjs-com';
import * as XLSX from 'xlsx';
import moment from 'moment';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScienceIcon from '@mui/icons-material/Science';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import './SchedulerResponsive.css';


const { TabPane } = Tabs;
const { Option } = Select;

const typeMeta = {
  exam: { color: '#ff4d4f', icon: <AssignmentIcon fontSize="small" /> },
  test: { color: '#fa8c16', icon: <DescriptionIcon fontSize="small" /> },
  practical: { color: '#13c2c2', icon: <ScienceIcon fontSize="small" /> },
  'study session': { color: '#52c41a', icon: <SchoolIcon fontSize="small" /> },
  general: { color: '#1890ff', icon: <EventIcon fontSize="small" /> }
};

const Scheduler = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Student');
  const [activeTab, setActiveTab] = useState('calendar');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('dueSoon'); // 'dueSoon' or 'dueLater'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email || '');
        setUserName(user.displayName || 'Student');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'scheduler'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setScheduleData(data);
    });
    return () => unsubscribe();
  }, [userId]);

  const openModal = (record = null) => {
    if (record) {
      form.setFieldsValue({
        ...record,
        date: moment(record.date, 'YYYY-MM-DD'),
        time: moment(record.time, 'HH:mm')
      });
      setEditingId(record.id);
    } else {
      form.resetFields();
      setEditingId(null);
    }
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        userId,
        completed: false,
        type: activeTab === 'calendar' ? 'general' : activeTab,
        createdAt: new Date()
      };

      if (editingId) {
        await updateDoc(doc(db, 'scheduler', editingId), payload);
      } else {
        await addDoc(collection(db, 'scheduler'), payload);
        await emailjs.send(
          'service_fbe2r6a',
          'template_w3ta77s',
          {
            to_name: userName,
            to_email: userEmail,
            module: payload.module,
            date: payload.date,
            time: payload.time
          },
          'LzPgSVA9DdgmHszJ3'
        );
      }

      setVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (err) {
      console.error('Error saving entry:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'scheduler', id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const toggleCompleted = async (record) => {
    try {
      await updateDoc(doc(db, 'scheduler', record.id), {
        completed: !record.completed
      });
    } catch (err) {
      console.error('Error updating completion status:', err);
    }
  };

  const generateGoogleCalendarUrl = (task) => {
    const start = moment(`${task.date} ${task.time}`, 'YYYY-MM-DD HH:mm');
    const end = start.clone().add(task.duration.match(/\d+/)[0] || 1, 'hours');
    const format = 'YYYYMMDDTHHmmss';

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', task.module);
    url.searchParams.set('dates', `${start.format(format)}/${end.format(format)}`);
    url.searchParams.set('details', `Type: ${task.type}\nDuration: ${task.duration}`);
    url.searchParams.set('location', 'Online');
    return url.toString();
  };

  const exportToCSV = () => {
    const filtered = scheduleData.filter(entry => entry.type === activeTab);
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    XLSX.writeFile(wb, `Schedule_${activeTab}.xlsx`);
  };

  const columns = [
    {
      title: '✔️',
      render: (_, record) => (
        <Checkbox checked={record.completed} onChange={() => toggleCompleted(record)} />
      )
    },
    { title: 'Module', dataIndex: 'module' },
    { title: 'Date', dataIndex: 'date' },
    { title: 'Time', dataIndex: 'time' },
    { title: 'Duration', dataIndex: 'duration' },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => openModal(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
          <a href={generateGoogleCalendarUrl(record)} target="_blank" rel="noreferrer">
            <Button icon={<CalendarOutlined />} type="link">Add to Google Calendar</Button>
          </a>
        </>
      )
    }
  ];

  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    return scheduleData.filter(entry =>
      entry.date === dateStr &&
      (filterType === 'all' || entry.type === filterType)
    );
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item, index) => {
          const meta = typeMeta[item.type] || {};
          const daysLeft = moment(item.date).diff(moment(), 'days');
          return (
            <Tooltip
              key={index}
              title={
                <div style={{ padding: 10 }}>
                  <div><strong>{item.module}</strong></div>
                  <div><b>Type:</b> {item.type}</div>
                  <div><AccessTimeIcon fontSize="small" /> {item.time}</div>
                  <div><TimerIcon fontSize="small" /> {item.duration}</div>
                  <div><HourglassBottomIcon fontSize="small" /> {daysLeft >= 0 ? `${daysLeft} day(s) left` : `Passed`}</div>
                  <div><b>Status:</b> {item.completed ? '✅ Completed' : '🕒 Pending'}</div>
                </div>
              }
              placement="top"
            >
              <li style={{
                background: meta.color || '#1890ff',
                color: 'white',
                borderRadius: 4,
                padding: '2px 6px',
                marginBottom: 2,
                fontSize: 12,
                textDecoration: item.completed ? 'line-through' : 'none'
              }}>
                {meta.icon} {item.module}
              </li>
            </Tooltip>
          );
        })}
      </ul>
    );
  };

  const dashboardStats = useMemo(() => {
    const today = moment().format('YYYY-MM-DD');
    const now = moment();

    const tasksToday = scheduleData.filter(e => e.date === today).length;
    const upcoming = scheduleData.filter(e => moment(e.date).isAfter(now)).length;
    const totalHours = scheduleData.reduce((sum, e) => {
      const match = e.duration.match(/(\d+)(h|hour)/i);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    const weekMap = {};
    scheduleData.forEach(e => {
      const date = moment(e.date);
      if (date.isSameOrAfter(moment().startOf('week')) && date.isSameOrBefore(moment().endOf('week'))) {
        weekMap[e.type] = (weekMap[e.type] || 0) + 1;
      }
    });

    return { tasksToday, upcoming, totalHours, weekMap };
  }, [scheduleData]);

  return (
    <div className="p-4">
      <Row gutter={16} className="mb-4">
        <Col span={6}><Card><Statistic title="Tasks Today" value={dashboardStats.tasksToday} /></Card></Col>
        <Col span={6}><Card><Statistic title="Upcoming Deadlines" value={dashboardStats.upcoming} /></Card></Col>
        <Col span={6}><Card><Statistic title="Total Hours Scheduled" value={dashboardStats.totalHours} /></Card></Col>
        <Col span={6}>
          <Card title="Weekly Focus">
            {Object.entries(dashboardStats.weekMap).map(([type, count]) => (
              <div key={type} style={{ marginBottom: 8 }}>
                <b>{type}:</b>
                <Progress percent={Math.floor((count / 7) * 100)} size="small" strokeColor={typeMeta[type]?.color || '#1890ff'} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <div className="mb-4 flex items-center gap-2">
        <Select defaultValue="all" onChange={setFilterType} style={{ width: 200 }}>
          <Option value="all">All Types</Option>
          {Object.keys(typeMeta).map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
        <Button icon={<PlusOutlined />} onClick={() => openModal()}>Add Task</Button>
        <Button icon={<DownloadOutlined />} onClick={exportToCSV}>Export</Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Calendar" key="calendar">
          <Calendar dateCellRender={dateCellRender} />
        </TabPane>
        {Object.entries(typeMeta).map(([tab, meta]) => {
          const sortedData = scheduleData
            .filter(entry => entry.type === tab)
            .sort((a, b) => {
              const aDate = moment(a.date);
              const bDate = moment(b.date);
              return sortOrder === 'dueSoon' ? aDate.diff(bDate) : bDate.diff(aDate);
            });

          return (
            <TabPane
              key={tab}
              tab={<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{meta.icon}{tab}</span>}
            >
              <Table rowKey="id" columns={columns} dataSource={sortedData} />
            </TabPane>
          );
        })}
      </Tabs>

      <Modal
        visible={visible}
        title={editingId ? 'Edit Task' : 'Add Task'}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="module" label="Module" rules={[{ required: true, message: 'Please enter a module' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Please select a time' }]}>
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration" label="Duration" rules={[{ required: true, message: 'Please enter duration (e.g., 2 hours)' }]}>
            <Input placeholder="e.g., 2 hours" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Scheduler;
