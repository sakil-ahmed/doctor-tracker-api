import { User } from '../models';
import type { IUserDocument } from '../models';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import type { LoginInput } from '../validators/auth.validator';

export const loginUser = async (
  input: LoginInput
): Promise<{ user: IUserDocument; token: string }> => {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select(
    '+password'
  );

  if (!user || !(await user.comparePassword(input.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  user.password = undefined as unknown as string;

  return { user, token };
};

export const getCurrentUser = async (
  userId: string
): Promise<IUserDocument> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};
