import { auth } from '@clerk/nextjs/server';

const userGuard = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not found');
  }

  return userId;
};

export default userGuard;
