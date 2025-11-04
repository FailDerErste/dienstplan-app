import { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ServicesContext } from '../servicesContext';
import { useTheme } from '../ThemeContext';

const ServiceList = ({ services, selectedService, setSelectedService }) => {
  const { reloadKey } = useContext(ServicesContext);
  const { mode } = useTheme();

  return (
    <View key={reloadKey} style={styles.container}>
    {services.map(service => {
      const isSelected = selectedService?.id === service.id;
      const isDarkMode = mode === 'dark' || mode === 'darkgray';
      const borderColor = isSelected ? (isDarkMode ? '#FFF' : '#000') : 'transparent';
      const backgroundColor = (service.color || '#FF0000');

      return (
        <TouchableOpacity
          key={service.id}
          style={[
            styles.service,
            { backgroundColor, borderColor }
          ]}
          onPress={() => setSelectedService(isSelected ? null : service)}
        >
          <Text style={styles.serviceText}>{service.name}</Text>
        </TouchableOpacity>
      );
    })}

    </View>
  );
};

export default ServiceList;
const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 10 },
  service: { padding: 10, margin: 5, borderRadius: 6, borderWidth: 2 },
  serviceText: { color: '#fff', fontWeight: 'bold' }
});
