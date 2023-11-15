import CommonModal from "@/app/Shared/Modal";
import { StateContext } from "@/app/context";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useContext, useEffect, useState } from "react";

dayjs.extend(customParseFormat);

const Appointments = () => {
  const { Title } = Typography;
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    useState(false);
  const [data, setData] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string>("");
  const { baseURL } = useContext<any>(StateContext);

  const user: any = localStorage.getItem("user");

  const fetchData = async () => {
    const response = await fetch(`${baseURL}/get-appointments`);
    const data = await response.json();

    setData(data);
  };

  const fetchAllPatients = async () => {
    const response = await fetch(`${baseURL}/get-all-patients`);
    const data = await response.json();

    setPatients(data);
  };

  const fetchAllDoctors = async () => {
    const response = await fetch(`${baseURL}/get-doctors`);
    const data = await response.json();

    setDoctors(data);
  };

  const onFinish = (values: any) => {
    const { appointmentDate, patient, doctor } = values;
    const formattedDate = dayjs(appointmentDate).format();

    if (editingAppointment) {
      fetch(`${baseURL}/reschedule-appointment/${editingAppointment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newDate: formattedDate,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Appointment updated successfully", data);
          setIsAppointmentModalVisible(false);
          setEditingAppointment(null);
          fetchData();
        })
        .catch((error) => {
          console.error("Error during update:", error);
        });
    } else {
      fetch(`${baseURL}/add-appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formattedDate,
          patient: patient,
          doctor: doctor,
          appointedBy: JSON.parse(user).user._id,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Appointment added successfully", data);
          setIsAppointmentModalVisible(false);
          fetchData();
        })
        .catch((error) => {
          console.error("Error during add:", error);
        });
    }
  };

  const editAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setIsAppointmentModalVisible(true);
  };

  const cancelAppointment = (id: string) => {
    fetch(`${baseURL}/cancel-appointment/${id}`, {
      method: "PATCH",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        console.log("Appointment cancelled successfully");
        fetchData();
      })
      .catch((error) => {
        console.error("Error during cancellation:", error);
      });
  };

  const columns: ColumnsType<any> = [
    {
      title: "Patient Name",
      key: "patientName",
      render: (_, record) => <p>{record?.patient?.fullName}</p>,
    },
    {
      title: "Doctor Name",
      key: "doctorName",
      render: (_, record) => <p>{record?.doctor?.name}</p>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Appointment Date",
      key: "date",
      render: (_, record) => <p>{dayjs(record.date).format("DD/MM/YYYY")}</p>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <Space size="middle">
            <EditOutlined onClick={() => editAppointment(record)} />
            {record.status !== "CANCELED" && (
              <CloseOutlined
                onClick={() => {
                  setConfirmCancelModal(!confirmCancelModal);
                  setCancelAppointmentId(record._id);
                }}
              />
            )}
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    fetchData();
    fetchAllPatients();
    fetchAllDoctors();
  }, []);

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    setIsAppointmentModalVisible(false);
  };

  return (
    <div>
      <div className="">
        <Title>Appointments</Title>
        <Button
          onClick={() =>
            setIsAppointmentModalVisible(!isAppointmentModalVisible)
          }
        >
          Add a appointment
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
      {isAppointmentModalVisible && (
        <CommonModal
          title={
            editingAppointment ? "Reschedule Appointment" : "Add an Appointment"
          }
          visible={isAppointmentModalVisible}
          isAddOrUpdate
        >
          <Form
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            initialValues={{
              appointmentDate: editingAppointment?.date
                ? dayjs(editingAppointment?.date)
                : null,
            }}
          >
            <Form.Item<any>
              label="Appointment Date"
              name="appointmentDate"
              rules={[
                { required: true, message: "Please select appointment date!" },
              ]}
            >
              <DatePicker placeholder="Appointment Date" />
            </Form.Item>
            {!editingAppointment && (
              <>
                <Form.Item<any>
                  label="Patient"
                  name="patient"
                  rules={[
                    { required: true, message: "Please select a patient!" },
                  ]}
                >
                  <Select
                    placeholder="Select a patient"
                    allowClear
                    options={patients.map((patient) => ({
                      value: patient._id,
                      label: patient.fullName,
                    }))}
                  />
                </Form.Item>
                <Form.Item<any>
                  label="Doctor"
                  name="doctor"
                  rules={[
                    { required: true, message: "Please select a doctor!" },
                  ]}
                >
                  <Select
                    placeholder="Select a doctor"
                    allowClear
                    options={doctors.map((doctor) => ({
                      value: doctor._id,
                      label: doctor.name,
                    }))}
                  />
                </Form.Item>
              </>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingAppointment ? "Reschedule" : "Add"} Appointment
              </Button>
            </Form.Item>
          </Form>
        </CommonModal>
      )}
      {confirmCancelModal && (
        <CommonModal
          title="Cancel Appointment"
          visible={confirmCancelModal}
          onOk={() => {
            cancelAppointment(cancelAppointmentId);
            setConfirmCancelModal(!confirmCancelModal);
          }}
          onCancel={() => setConfirmCancelModal(!confirmCancelModal)}
        >
          <p>Are you sure you want to cancel this appointment?</p>
        </CommonModal>
      )}
    </div>
  );
};

export default Appointments;
