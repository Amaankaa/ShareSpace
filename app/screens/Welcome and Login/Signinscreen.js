import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { signIn, useGoogleSignIn } from '../../utils/auth';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { promptAsync } = useGoogleSignIn();
  const [loginError, setLoginError] = useState('');

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShareSpace</Text>

      <View style={styles.card}>
        <LinearGradient
          colors={['#fff5ea', 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.gradient}
        >
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values) => {
              setLoginError('');
              const { user, error } = await signIn(
                values.email.trim(),
                values.password.trim()
              );
              if (error) {
                setLoginError(error);
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="example@thing.com"
                    placeholderTextColor="#ccc"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="************"
                    secureTextEntry
                    placeholderTextColor="#ccc"
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {loginError ? (
                  <Text style={styles.errorText}>{loginError}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.loginButtonText}>Log in</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
          >
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.accountText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUpScreen')}
            >
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptAsync()}
          >
            <Ionicons name="logo-google" size={20} color="black" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    fontFamily: 'serif',
  },
  card: {
    width: '85%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ed872e',
    overflow: 'hidden',
  },
  gradient: {
    padding: 30,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#ed872e',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#555',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  signupRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  accountText: {
    color: '#555',
  },
  signupText: {
    color: '#ed872e',
    fontWeight: 'bold',
  },
  googleButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  googleButtonText: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
});
