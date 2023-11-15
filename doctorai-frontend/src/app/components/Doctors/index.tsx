import React, { useContext, useEffect, useState } from "react";
import {
  Typography,
  Space,
  Table,
  Tag,
  Input,
  Form,
  Button,
  Drawer,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import CommonModal from "@/app/Shared/Modal";
import { StateContext } from "@/app/context";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

type DoctorFieldType = {
  fullname?: string;
  username?: string;
  password?: string;
  email?: string;
  speciality?: string;
};

const Doctors = () => {
  const { Title } = Typography;
  const [isDoctorModalVisible, setIsDoctorModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteDoctorId, setDeleteDoctorId] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [showDoctorDetailsDrawer, setShowDoctorDetailsDrawer] = useState(false);
  const [userDetails, setUserDetails] = useState<any>([]);
  const { baseURL } = useContext<any>(StateContext);

  const fetchData = async () => {
    const response = await fetch(`${baseURL}/get-doctors`);
    const data = await response.json();

    setData(data);
  };

  const onFinish = (values: any) => {
    const { fullname, username, password, email, speciality } = values;

    if (editingDoctor) {
      fetch(`${baseURL}/update-doctor/${editingDoctor._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullname,
          specialisation: speciality,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Doctor updated successfully", data);
          setIsDoctorModalVisible(false);
          setEditingDoctor(null);
          fetchData();
        })
        .catch((error) => {
          console.error("Error during update:", error);
        });
    } else {
      fetch(`${baseURL}/add-doctor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullname,
          username: username,
          password: password,
          email,
          specialisation: speciality,
          type: "doctor",
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Doctor added successfully", data);
          setIsDoctorModalVisible(false);
          fetchData();
        })
        .catch((error) => {
          console.error("Error during add:", error);
        });
    }
  };

  const deleteDoctor = (id: string) => {
    fetch(`${baseURL}/delete-doctor/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        console.log("Doctor deleted successfully");
        // Refresh the list of patients
        fetchData();
      })
      .catch((error) => {
        console.error("Error during deletion:", error);
      });
  };

  const editDoctor = (doctor: any) => {
    setEditingDoctor(doctor);
    setIsDoctorModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Doctor Name",
      key: "name",
      render: (_, record) => (
        <a
          onClick={() => {
            setShowDoctorDetailsDrawer(!showDoctorDetailsDrawer);
            setUserDetails(record);
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Specialisation",
      dataIndex: "specialisation",
      key: "specialisation",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <Space size="middle">
            <EditOutlined onClick={() => editDoctor(record)} />
            <DeleteOutlined
              onClick={() => {
                setConfirmDelete(!confirmDelete);
                setDeleteDoctorId(record._id);
              }}
            />
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const onDrawerClose = () => {
    setShowDoctorDetailsDrawer(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    setIsDoctorModalVisible(false);
  };

  return (
    <div>
      <div className="">
        <Title>Doctors</Title>
        <Button onClick={() => setIsDoctorModalVisible(!isDoctorModalVisible)}>
          Add a doctor
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "30", "40"],
          position: ["bottomRight"],
        }}
      />
      {userDetails && (
        <Drawer
          title={`Doctor Details`}
          placement="right"
          onClose={onDrawerClose}
          open={showDoctorDetailsDrawer}
        >
          <p>
            <b>Full name: </b>
            {userDetails.name}
          </p>
          <p>
            <b>Username: </b>
            {userDetails.username}
          </p>
          <p>
            <b>Email: </b> {userDetails.email}
          </p>
          <p>
            <b>Specialisation: </b> {userDetails.specialisation}
          </p>
        </Drawer>
      )}
      {isDoctorModalVisible && (
        <CommonModal
          title="Add A Doctor"
          visible={isDoctorModalVisible}
          isAddOrUpdate
        >
          <Form
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            initialValues={{
              fullname: editingDoctor?.name,
              speciality: editingDoctor?.specialisation,
            }}
          >
            <Form.Item<DoctorFieldType>
              label="Full name"
              name="fullname"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input placeholder="Full name" />
            </Form.Item>
            {!editingDoctor && (
              <Form.Item<DoctorFieldType>
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input placeholder="Username" />
              </Form.Item>
            )}
            {!editingDoctor && (
              <Form.Item<DoctorFieldType>
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
            )}
            {!editingDoctor && (
              <Form.Item<DoctorFieldType>
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            )}
            <Form.Item<DoctorFieldType>
              label="Speciality"
              name="speciality"
              rules={[
                { required: true, message: "Please input your speciality!" },
              ]}
            >
              <Input placeholder="Speciality" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingDoctor ? "Update" : "Add"} Doctor
              </Button>
            </Form.Item>
          </Form>
        </CommonModal>
      )}
      {confirmDelete && (
        <CommonModal
          title="Delete Doctor"
          visible={confirmDelete}
          onOk={() => {
            deleteDoctor(deleteDoctorId);
            setConfirmDelete(!confirmDelete);
          }}
          onCancel={() => setConfirmDelete(!confirmDelete)}
        >
          <p>Are you sure you want to delete this doctor?</p>
        </CommonModal>
      )}
    </div>
  );
};

export default Doctors;
