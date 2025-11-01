import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
const [services, setServices] = useState([]); // {id, name, desc, start, end, color}
const [assignments, setAssignments] = useState({}); // { '2025-10-14': serviceId }
const [is24h, setIs24h] = useState(true); // 🔄 globales Zeitformat
const [reloadKey, setReloadKey] = useState(0); // 🔄 for forcing re-render on time format change
const [overrides, setOverrides] = useState({}); // per-date overrides for calendar entries

  // Initialdaten laden mit Migration
   useEffect(() => {
     (async () => {
       try {
         const s = await AsyncStorage.getItem('services');
         const a = await AsyncStorage.getItem('assignments');
         const f = await AsyncStorage.getItem('timeFormat');
         const o = await AsyncStorage.getItem('overrides');
         if (s) setServices(JSON.parse(s));
         if (a) setAssignments(JSON.parse(a));
         if (f) setIs24h(f === '24');
         if (o) setOverrides(JSON.parse(o));
         // Migration: Ensure all services have required fields
         setServices(prev => prev.map(svc => ({
           ...svc,
           desc: svc.desc || '',
           start: svc.start || '',
           end: svc.end || '',
         })));
       } catch (e) {
         console.warn(e);
       }
     })();
   }, []);

  // Änderungen speichern
  useEffect(() => {
    AsyncStorage.setItem('services', JSON.stringify(services));
  }, [services]);
  useEffect(() => {
    AsyncStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    AsyncStorage.setItem('timeFormat', is24h ? '24' : '12');
  }, [is24h]);
  useEffect(() => {
    AsyncStorage.setItem('overrides', JSON.stringify(overrides));
  }, [overrides]);

  // Dienst-Operationen
  const addService = (svc) =>
    setServices((prev) => [...prev, { ...svc, id: Date.now().toString() }]);
 
  const updateService = (id, patch) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
 
  const removeService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setAssignments((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (copy[k] === id) delete copy[k];
      });
      return copy;
    });
  };
 
  const assignToDay = (dateISO, serviceId) =>
    setAssignments((prev) => ({ ...prev, [dateISO]: serviceId }));
 
  const removeFromDay = (dateISO) =>
    setAssignments((prev) => {
      const c = { ...prev };
      delete c[dateISO];
      return c;
    });
 
  const setDayOverride = (dateISO, patch) =>
    setOverrides((prev) => {
      const current = prev[dateISO] || {};
      return { ...prev, [dateISO]: { ...current, ...patch } };
    });
 
  const removeDayOverride = (dateISO) =>
    setOverrides((prev) => {
      const copy = { ...prev };
      delete copy[dateISO];
      return copy;
    });
 
  const clearAll = () => setAssignments({});

  const reloadServiceList = () => setReloadKey((k) => k + 1);

  // Wrapper for setIs24h to auto-reload
  const setIs24hSafe = (value) => {
    setIs24h(value);
    reloadServiceList();
  };

  // Validation API
  const validateAll = () => {
    const issues = [];
    // Check for orphaned assignments (service deleted but assignment remains)
    Object.entries(assignments).forEach(([date, serviceId]) => {
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        issues.push(`Orphaned assignment on ${date}: service ${serviceId} not found`);
      }
    });
    // Check for invalid time formats
    services.forEach(svc => {
      if (svc.start && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(svc.start)) {
        issues.push(`Invalid start time for service "${svc.name}": ${svc.start}`);
      }
      if (svc.end && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(svc.end)) {
        issues.push(`Invalid end time for service "${svc.name}": ${svc.end}`);
      }
    });
    // Check overrides for invalid times
    Object.entries(overrides).forEach(([date, over]) => {
      if (over.start && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(over.start)) {
        issues.push(`Invalid override start time on ${date}: ${over.start}`);
      }
      if (over.end && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(over.end)) {
        issues.push(`Invalid override end time on ${date}: ${over.end}`);
      }
    });
    return issues;
  };

  // Provide updated API including new hooks and helpers
  return (
    <ServicesContext.Provider
      value={{
        services,
        assignments,
        overrides,
        addService,
        updateService,
        removeService,
        assignToDay,
        removeFromDay,
        setDayOverride,
        removeDayOverride,
        clearAll,
        is24h,
        setIs24h: setIs24hSafe, // 🔄 global verfügbar
        reloadKey,
        reloadServiceList,
        validateAll,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
