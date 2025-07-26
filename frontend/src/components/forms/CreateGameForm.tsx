import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '@/components/common/Button';
import { CreateGameRequest } from '@/types/game';
import { GAME_CONSTANTS } from '@/utils/constants';

interface CreateGameFormProps {
  onSubmit: (data: CreateGameRequest) => Promise<void>;
  loading?: boolean;
  error?: string;
}

const schema = yup.object({
  maxPlayers: yup
    .number()
    .min(GAME_CONSTANTS.MIN_PLAYERS, `Minimum ${GAME_CONSTANTS.MIN_PLAYERS} players`)
    .max(GAME_CONSTANTS.MAX_PLAYERS, `Maximum ${GAME_CONSTANTS.MAX_PLAYERS} players`)
    .required('Maximum players is required'),
}).required();

const CreateGameForm: React.FC<CreateGameFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateGameRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      maxPlayers: GAME_CONSTANTS.DEFAULT_MAX_PLAYERS,
    },
  });

  const maxPlayers = watch('maxPlayers');

  const handleFormSubmit = async (data: CreateGameRequest) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Create New Game
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Create a new game room and invite other players to join.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Players
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min={GAME_CONSTANTS.MIN_PLAYERS}
            max={GAME_CONSTANTS.MAX_PLAYERS}
            {...register('maxPlayers')}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
            {maxPlayers}
          </span>
        </div>
        {errors.maxPlayers && (
          <p className="mt-1 text-sm text-danger-600">
            {errors.maxPlayers.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Choose how many players can join your game (2-8 players)
        </p>
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
          Create Game
        </Button>
      </div>
    </form>
  );
};

export default CreateGameForm; 