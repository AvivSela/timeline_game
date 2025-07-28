import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '@/components/common/Button';
import { JoinGameRequest } from '@/types/game';
import { GAME_CONSTANTS } from '@/utils/constants';

interface JoinGameFormProps {
  onSubmit: (data: JoinGameRequest) => Promise<void>;
  loading?: boolean;
  error?: string;
  initialRoomCode?: string;
}

const schema = yup.object({
  roomCode: yup
    .string()
    .length(GAME_CONSTANTS.ROOM_CODE_LENGTH, `Room code must be ${GAME_CONSTANTS.ROOM_CODE_LENGTH} characters`)
    .matches(/^[A-Z0-9]+$/, 'Room code must contain only uppercase letters and numbers')
    .required('Room code is required'),
  playerName: yup
    .string()
    .min(2, 'Player name must be at least 2 characters')
    .max(20, 'Player name must be less than 20 characters')
    .matches(/^[a-zA-Z0-9\s-_]+$/, 'Player name can only contain letters, numbers, spaces, hyphens, and underscores')
    .required('Player name is required'),
}).required();

const JoinGameForm: React.FC<JoinGameFormProps> = ({
  onSubmit,
  loading = false,
  error,
  initialRoomCode = '',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<JoinGameRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      roomCode: initialRoomCode,
      playerName: '',
    },
  });

  // Set initial room code when component mounts or initialRoomCode changes
  React.useEffect(() => {
    if (initialRoomCode) {
      setValue('roomCode', initialRoomCode);
    }
  }, [initialRoomCode, setValue]);

  const handleFormSubmit = async (data: JoinGameRequest) => {
    await onSubmit(data);
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setValue('roomCode', value);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Join Game
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter the room code and your name to join an existing game.
        </p>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room Code <span className="text-danger-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter 6-character room code"
          maxLength={GAME_CONSTANTS.ROOM_CODE_LENGTH}
          className={`input ${errors.roomCode ? 'input-error' : ''}`}
          {...register('roomCode')}
          onChange={handleRoomCodeChange}
          required
        />
        {errors.roomCode && (
          <p className="mt-1 text-sm text-danger-600">{errors.roomCode.message}</p>
        )}
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name <span className="text-danger-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter your name"
          maxLength={20}
          className={`input ${errors.playerName ? 'input-error' : ''}`}
          {...register('playerName')}
          required
        />
        {errors.playerName && (
          <p className="mt-1 text-sm text-danger-600">{errors.playerName.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-danger-50 border border-danger-200 p-4">
          <p className="text-sm text-danger-800">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Join Game
        </Button>
      </div>
    </form>
  );
};

export default JoinGameForm; 