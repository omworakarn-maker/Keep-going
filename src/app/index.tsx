import { Redirect } from 'expo-router';
import { useApp } from '../context/AppContext';

export default function Index() {
  const { hasOnboarded } = useApp();
  return <Redirect href={hasOnboarded ? '/(tabs)/Home' : '/Welcome'} />;
}
