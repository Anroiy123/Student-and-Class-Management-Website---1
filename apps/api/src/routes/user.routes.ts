import { Router } from 'express';
import {
  listUsers,
  getUser,
  approveUser,
  lockUser,
  unlockUser,
  linkAccount,
  deleteUser,
  getUnlinkedRecords,
} from '../controllers/user.controller';
import {
  listUsersSchema,
  getUserSchema,
  approveUserSchema,
  lockUserSchema,
  unlockUserSchema,
  linkAccountSchema,
  deleteUserSchema,
} from '../schemas/user.schema';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth());
router.use(requireRole('ADMIN'));

router.get('/', validateRequest(listUsersSchema), listUsers);
router.get('/unlinked', getUnlinkedRecords);
router.get('/:id', validateRequest(getUserSchema), getUser);
router.put('/:id/approve', validateRequest(approveUserSchema), approveUser);
router.put('/:id/lock', validateRequest(lockUserSchema), lockUser);
router.put('/:id/unlock', validateRequest(unlockUserSchema), unlockUser);
router.put('/:id/link', validateRequest(linkAccountSchema), linkAccount);
router.delete('/:id', validateRequest(deleteUserSchema), deleteUser);

export const userRoutes = router;

