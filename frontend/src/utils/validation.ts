export const validateRoomCode = (roomCode: string): string | null => {
  if (!roomCode) {
    return 'Room code is required';
  }
  
  if (roomCode.length !== 6) {
    return 'Room code must be 6 characters long';
  }
  
  if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
    return 'Room code must contain only uppercase letters and numbers';
  }
  
  return null;
};

export const validatePlayerName = (name: string): string | null => {
  if (!name) {
    return 'Player name is required';
  }
  
  if (name.length < 2) {
    return 'Player name must be at least 2 characters long';
  }
  
  if (name.length > 20) {
    return 'Player name must be less than 20 characters long';
  }
  
  if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
    return 'Player name can only contain letters, numbers, spaces, hyphens, and underscores';
  }
  
  return null;
};

export const validateMaxPlayers = (maxPlayers: number): string | null => {
  if (maxPlayers < 2) {
    return 'Maximum players must be at least 2';
  }
  
  if (maxPlayers > 8) {
    return 'Maximum players cannot exceed 8';
  }
  
  return null;
};

export const validateForm = (values: Record<string, any>, validators: Record<string, (value: any) => string | null>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(validators).forEach(field => {
    const validator = validators[field];
    const value = values[field];
    const error = validator(value);
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
}; 