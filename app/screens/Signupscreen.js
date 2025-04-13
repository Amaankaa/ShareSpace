import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { AntDesign } from '@expo/vector-icons';
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigation } from '@react-navigation/native';

const SignupSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    gender: Yup.string().required("Gender is required"),
    role: Yup.string().required("Role is required"),
    department: Yup.string().required("Department is required"),
  });
  

const { width } = Dimensions.get('window');

const SignupScreen = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.header}>ShareSpace</Text>
      <View style={styles.card}>
        <LinearGradient
          colors={['#fff5ea', 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.gradient}
        >
            
          <ScrollView contentContainerStyle={styles.scroll}><Formik
  initialValues={{
    firstName: '',
    lastName: '',
    gender: '',
    role: '',
    department: '',
    email: '',
    password: '',
  }}
  validationSchema={SignupSchema}
  onSubmit={values => {
    console.log(values);
  }}
>
  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
    <>
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        onChangeText={handleChange('firstName')}
        onBlur={handleBlur('firstName')}
        value={values.firstName}
      />
      {touched.firstName && errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        onChangeText={handleChange('lastName')}
        onBlur={handleBlur('lastName')}
        value={values.lastName}
      />
      {touched.lastName && errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={values.role}
          onValueChange={value => setFieldValue('role', value)}
          style={styles.picker}
        >
          <Picker.Item label="Role" value="" />
          <Picker.Item label="Junior" value="junior" />
          <Picker.Item label="Senior" value="senior" />
        </Picker>
      </View>
      {touched.role && errors.role && <Text style={styles.error}>{errors.role}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="example@thing.com"
        placeholderTextColor="#aaa"
        onChangeText={handleChange('email')}
        onBlur={handleBlur('email')}
        value={values.email}
      />
      {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="************"
        onChangeText={handleChange('password')}
        onBlur={handleBlur('password')}
        value={values.password}
      />
      {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TouchableOpacity style={styles.signupButton} onPress={handleSubmit}>
        <Text style={styles.signupText}>Sign up</Text>
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <Text style={styles.accountText}>I already have account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SigninScreen')}>
            <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.googleButton}>
        <AntDesign name="google" size={20} color="black" />
        <Text style={styles.googleText}>Sign up with google</Text>
      </TouchableOpacity>
    </>
  )}
</Formik>
</ScrollView>
        </LinearGradient>
      </View>
    </View>
  );
};

export default SignupScreen;
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: width * 0.9,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#e17d27',
      overflow: 'hidden',
      height: '80%',
    },
    gradient: {
      flex: 1,
      padding: 20,
    },
    scroll: {
      paddingBottom: 30,
    },
    header: {
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2f2f2f',
      marginTop: 30,
      marginBottom: 20
    },
    label: {
        fontFamily: 'Poppins-Regular',
      fontSize: 14,
      color: '#333',
      marginTop: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: Platform.OS === 'ios' ? 12 : 8,
      marginTop: 6,
      marginBottom: 10,
      fontSize: 14,
      color: '#333',
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 10,
      marginTop: 6,
    },
    picker: {
      height: 50,
      color: '#333',
    },
    signupButton: {
      backgroundColor: '#e17d27',
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 10,
      alignItems: 'center',
    },
    signupText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    loginRow: {
      flexDirection: 'row',
      marginTop: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountText: {
      color: '#333',
    },
    signInText: {
      color: '#e17d27',
      fontWeight: '500',
    },
    googleButton: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 14,
      gap: 8,
    },
    googleText: {
      color: '#333',
      fontWeight: '500',
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
      },      
  });
  