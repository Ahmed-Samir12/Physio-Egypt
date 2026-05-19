import * as adminService from './admin.services.js';

export const getDashboard = async (req, res) => {
  const data = await adminService.getAdminDashboard(req.query);
  res.status(200).json({ status: 'success', data });
};

export const getAllUsers = async (req, res) => {
  const all = req.query.all === '1';
  const pending = req.query.pending === '1';
  const users = await adminService.getAllUsers({ all, pending });
  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
};

export const approveUser = async (req, res) => {
  const user = await adminService.approveUser(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'تم تفعيل حساب المستخدم.',
    data: { user },
  });
};

export const rejectUser = async (req, res) => {
  await adminService.rejectUser(req.params.id);
  res.status(200).json({ status: 'success', message: 'تم رفض وحذف الحساب.' });
};

export const deleteUser = async (req, res) => {
  await adminService.deleteUser(req.params.id, req.user._id);
  res.status(200).json({
    status: 'success',
    message: 'تم حذف المستخدم وجميع حجوزاته نهائياً.',
  });
};

export const deactivateUser = async (req, res) => {
  await adminService.deactivateUser(req.params.id);
  res
    .status(200)
    .json({ status: 'success', message: 'User account deactivated.' });
};

export const reactivateUser = async (req, res) => {
  await adminService.reactivateUser(req.params.id);
  res
    .status(200)
    .json({ status: 'success', message: 'User account reactivated.' });
};

export const getEmployeeDetail = async (req, res) => {
  const data = await adminService.getEmployeeDetail(req.params.id, req.query);
  res.status(200).json({ status: 'success', data });
};

export const changeUserRole = async (req, res) => {
  const user = await adminService.changeUserRole(
    req.params.id,
    req.body.role,
    req.user._id,
  );

  res.status(200).json({
    status: 'success',
    message: `تم تغيير الصلاحية إلى ${user.role}.`,
    data: { user },
  });
};

export const getEmployeePerformance = async (req, res) => {
  const data = await adminService.getEmployeePerformance();
  res.status(200).json({ status: 'success', data: { performance: data } });
};
