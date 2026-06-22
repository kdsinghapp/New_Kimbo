import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://randomuser.me/api/?results=10');
      const json = await response.json();

      const formattedData = json.results.map((item: any, index: number) => ({
        id: index.toString(),
        name: `${item.name.first} ${item.name.last}`,
        email: item.email,
        image: item.picture.large,
        date: new Date(item.registered.date).toDateString(),
      }));

      setData(formattedData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 0.5, // 50% quality
      allowsEditing: false, // crop band

    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitNewUser = async () => {
    if (!newName || !newEmail || !imageUri) {
      Alert.alert('Error', 'Please fill all fields and select an image');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newName);
      formData.append('email', newEmail);
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      // Dummy POST API call
      const response = await fetch('https://jsonplaceholder.typicode.com/users', {
        method: 'POST',
        body: formData,
      });

      const newItem = {
        id: Date.now().toString(),
        name: newName,
        email: newEmail,
        image: imageUri,
        date: new Date().toDateString(),
      };

      setData([newItem, ...data] as any);
      closeModal();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = (id: string) => {
    const filteredData = data.filter((item: any) => item.id !== id);
    setData(filteredData);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewName('');
    setNewEmail('');
    setImageUri(null);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.avatar} />

      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.emailText}>{item.email}</Text>
        <Text style={styles.dateText}>Joined: {item.date}</Text>
      </View>

      {/* <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteUser(item.id)}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity> */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0B0F19" barStyle="light-content" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Connect</Text>
        <Text style={styles.headerSubtitle}>{data.length} Users</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New User</Text>
            <Text style={styles.modalSubtitle}>Fill the details to add a new connection</Text>

            {/* Upload Centered Component */}
            <View style={styles.uploadSection}>
              <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.uploadIconContainer}>
                    <Text style={styles.uploadIcon}>+</Text>
                    <Text style={styles.uploadText}>Upload Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#64748B"
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                value={newEmail}
                onChangeText={setNewEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={closeModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitNewUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Create User</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19', // Deep dark theme
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#334155',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emailText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    borderColor: '#334155',
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#475569',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  uploadedImage: {
    width: 106,
    height: 106,
    borderRadius: 53,
  },
  uploadIconContainer: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 28,
    color: '#6366F1',
    fontWeight: '300',
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0B0F19',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F8FAFC',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 1.5,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default App;
