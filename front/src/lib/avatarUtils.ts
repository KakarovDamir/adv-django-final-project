export const generateColorFromUsername = (username: string) => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
    'bg-emerald-500', 'bg-cyan-500', 'bg-blue-500',
    'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500'
  ];
  
  const hash = username.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0
  );
  
  return colors[hash % colors.length];
}; 