import jwt from 'jsonwebtoken';
import Employee from '../models/employeeSchema.js';

const verifyToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied. Token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. Token missing' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (verified.role === 'employee') {
      const active = await Employee.exists({
        _id: verified._id,
        employmentStatus: { $nin: ['relieved', 'deleting'] },
      });
      if (!active) return res.status(403).json({ message: 'Employee account is inactive' });
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token', error: err.message });
  }
};

export default verifyToken;
