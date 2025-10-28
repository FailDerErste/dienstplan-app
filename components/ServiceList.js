import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ServicesContext } from '../servicesContext';

const ServiceList = ({ services, selectedService, setSelectedService }) => {
  const { reloadKey } = useContext(ServicesContext);

  return (
    <View key={reloadKey} style={styles.container}>
    {services.map(service => (
      <TouchableOpacity
        key={service.id}
        style={[
          styles.service,
          { backgroundColor: service.color || '#FF0000' },
          selectedService?.id === service.id && styles.serviceSelected
        ]}
        onPress={() => setSelectedService(selectedService?.id === service.id ? null : service)}
      >
        <Text style={styles.serviceText}>{service.name}</Text>
      </TouchableOpacity>
    ))}

    </View>
  );
};

export default ServiceList;
const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 10 },
  service: { padding: 10, margin: 5, borderRadius: 6 },
  serviceSelected: { borderWidth: 2, borderColor: '#000' },
  serviceText: { color: '#fff', fontWeight: 'bold' }
});
