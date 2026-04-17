import * as adminService from './admin.services.js';

export const getDashboard = async (req, res) => {
  const data = await adminService.getAdminDashboard(req.query);
  res.status(200).json({ status: 'success', data });
};

export const getAllUsers = async (req, res) => {
  const all = req.query.all === '1';
  const users = await adminService.getAllUsers({ all });
  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
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
