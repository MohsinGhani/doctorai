import React, { useContext, useEffect, useState } from "react";
import {
  Typography,
  Space,
  Table,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Drawer,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import customParseFormat from "dayjs/plugin/customParseFormat";
import CommonModal from "@/app/Shared/Modal";
import { StateContext } from "@/app/context";
import dayjs from "dayjs";

dayjs.extend(customParseFormat);

type PatientFieldType = {
  fullname?: string;
  dob?: string;
  gender?: string;
  age?: number;
  address?: string;
  contact?: string;
  email?: string;
  disease?: string;
};

const Patients = () => {
  const { Title } = Typography;
  const [isPatientModalVisible, setIsPatientModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [showPatientDetailsDrawer, setShowPatientDetailsDrawer] =
    useState(false);
  const [userDetails, setUserDetails] = useState<any>([]);
  const { baseURL } = useContext<any>(StateContext);

  const fetchData = async () => {
    const response = await fetch(`${baseURL}/get-all-patients`);
    const data = await response.json();

    setData(data);
  };

  const onFinish = (values: any) => {
    const { address, contact, dob, age, disease, fullname, email, gender } =
      values;
    const formattedDate = dayjs(dob).format();

    if (editingPatient) {
      fetch(`${baseURL}/update-patient/${editingPatient._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullname,
          dateOfBirth: formattedDate,
          gender,
          address,
          age: +age,
          phone: contact,
          email,
          disease,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Patient updated successfully", data);
          setIsPatientModalVisible(false);
          setEditingPatient(null);
          fetchData();
        })
        .catch((error) => {
          console.error("Error during update:", error);
        });
    } else {
      fetch(`${baseURL}/add-patient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullname,
          dateOfBirth: formattedDate,
          gender,
          address,
          age: +age,
          phone: contact,
          email,
          disease,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Patient added successfully", data);
          setIsPatientModalVisible(false);
          fetchData();
        })
        .catch((error) => {
          console.error("Error during add:", error);
        });
    }
  };

  const deletePatient = (id: string) => {
    fetch(`${baseURL}/delete-patient/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        console.log("Patient deleted successfully");
        // Refresh the list of patients
        fetchData();
      })
      .catch((error) => {
        console.error("Error during deletion:", error);
      });
  };

  const editPatient = (patient: any) => {
    setEditingPatient(patient);
    setIsPatientModalVisible(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Patient Name",
      key: "fullName",
      render: (_, record) => (
        <a
          onClick={() => {
            setShowPatientDetailsDrawer(!showPatientDetailsDrawer);
            setUserDetails(record);
          }}
        >
          {record.fullName}
        </a>
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <Space size="middle">
            <EditOutlined onClick={() => editPatient(record)} />
            <DeleteOutlined
              onClick={() => {
                setConfirmDelete(!confirmDelete);
                setDeletePatientId(record._id);
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
    setShowPatientDetailsDrawer(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    setIsPatientModalVisible(false);
  };

  return (
    <div>
      <div className="">
        <Title>Patients</Title>
        <Button
          onClick={() => setIsPatientModalVisible(!isPatientModalVisible)}
        >
          Add a patient
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
          title={`Patient Details`}
          placement="right"
          onClose={onDrawerClose}
          open={showPatientDetailsDrawer}
        >
          <p>
            <b>Full name: </b>
            {userDetails.fullName}
          </p>
          <p>
            <b>Age: </b>
            {userDetails.age}
          </p>
          <p>
            <b>Date of Birth: </b>{" "}
            {dayjs(userDetails.dateOfBirth).format("DD/MM/YYYY")}
          </p>
          <p>
            <b>Disease: </b> {userDetails.disease}
          </p>
          <p>
            <b>Address: </b> {userDetails.address}
          </p>
          <p>
            <b>Contact: </b> {userDetails.phone}
          </p>
          <p>
            <b>Email: </b> {userDetails.email}
          </p>
          <p>
            <b>Gender: </b> {userDetails.gender}
          </p>
        </Drawer>
      )}
      {isPatientModalVisible && (
        <CommonModal
          title={editingPatient ? "Update Patient" : "Add A Patient"}
          visible={isPatientModalVisible}
          isAddOrUpdate
        >
          <Form
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            initialValues={{
              fullname: editingPatient?.fullName,
              dob: editingPatient?.dateOfBirth
                ? dayjs(editingPatient?.dateOfBirth)
                : null,
              age: editingPatient?.age,
              gender: editingPatient?.gender,
              address: editingPatient?.address,
              contact: editingPatient?.phone,
              email: editingPatient?.email,
              disease: editingPatient?.disease,
            }}
          >
            <Form.Item<PatientFieldType>
              label="Full name"
              name="fullname"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input placeholder="Full name" />
            </Form.Item>
            <Form.Item<PatientFieldType>
              label="Date of Birth"
              name="dob"
              rules={[
                { required: true, message: "Please input your date of birth!" },
              ]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item<PatientFieldType>
              label="Age"
              name="age"
              rules={[{ required: true, message: "Please input your age!" }]}
            >
              <Input placeholder="Age" type="number" />
            </Form.Item>
            <Form.Item<PatientFieldType>
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select your gender" }]}
            >
              <Select
                placeholder="Gender"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
              />
            </Form.Item>
            <Form.Item<PatientFieldType>
              label="Address"
              name="address"
              rules={[
                { required: true, message: "Please input your address!" },
              ]}
            >
              <Input.TextArea placeholder="Address" />
            </Form.Item>
            <Form.Item<PatientFieldType>
              label="Contact Information"
              name="contact"
              rules={[
                { required: true, message: "Please input your phone number!" },
              ]}
            >
              <Input placeholder="Phone number" />
            </Form.Item>
            <Form.Item<PatientFieldType>
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item<PatientFieldType>
              label="Disease"
              name="disease"
              rules={[{ required: true, message: "Please select a disease!" }]}
            >
              <Input placeholder="Disease" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingPatient ? "Update" : "Add"} Patient
              </Button>
            </Form.Item>
          </Form>
        </CommonModal>
      )}
      {confirmDelete && (
        <CommonModal
          title="Delete Patient"
          visible={confirmDelete}
          onOk={() => {
            deletePatient(deletePatientId);
            setConfirmDelete(!confirmDelete);
          }}
          onCancel={() => setConfirmDelete(!confirmDelete)}
        >
          <p>Are you sure you want to delete this patient?</p>
        </CommonModal>
      )}
    </div>
  );
};

export default Patients;
