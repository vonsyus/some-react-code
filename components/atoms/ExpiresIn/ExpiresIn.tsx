import { FC } from 'react';
import { useCountDown } from '@/components/CountDown/useCountDown';
import { formattedTime } from '@/utils/formattedTime';

type Props = {
  expireAt: string;
  className?: string;
  label?: string;
};

export const ExpiresIn: FC<Props> = ({ expireAt, className = '', label = 'Expires in' }) => {
  const [, hours, minutes, seconds] = useCountDown(expireAt);

  return (
    <p className={className}>
      {label} {`${formattedTime(hours)}:${formattedTime(minutes)}:${formattedTime(seconds)}`}
    </p>
  );
};
