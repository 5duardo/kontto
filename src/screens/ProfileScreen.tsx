import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button } from '../components/common';

type TabType = 'login' | 'register';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, isLoggedIn, login, logout, register, updateUserProfile } = useAppStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);
  const insets = useSafeAreaInsets();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<TabType>('login');
  const [editMode, setEditMode] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  // Edit profile form
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBio, setEditBio] = useState(user?.bio || '');

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor completa todos los campos');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await login(loginEmail, loginPassword);
      
      if (result.success) {
        setShowAuthModal(false);
        setLoginEmail('');
        setLoginPassword('');
        Alert.alert('Éxito', '¡Has iniciado sesión correctamente!');
      } else {
        setLoginError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setLoginError('Error al conectar con el servidor');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setRegisterError('Por favor completa todos los campos');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Las contraseñas no coinciden');
      return;
    }

    setRegisterLoading(true);
    setRegisterError('');

    try {
      const result = await register(registerName, registerEmail, registerPassword);
      
      if (result.success) {
        setShowAuthModal(false);
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
        Alert.alert('Éxito', '¡Te has registrado correctamente!');
      } else {
        setRegisterError(result.error || 'Error al registrarse');
      }
    } catch (error) {
      setRegisterError('Error al conectar con el servidor');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSaveProfile = () => {
    if (!editName || !editEmail) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    updateUserProfile({
      fullName: editName,
      email: editEmail,
      phone: editPhone,
      bio: editBio,
    });

    setEditMode(false);
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Sesión Cerrada', 'Has cerrado sesión correctamente');
          },
        },
      ]
    );
  };

  // If not logged in, show login/register screen
  if (!isLoggedIn || !user) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="person-circle" size={80} color={colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Bienvenido a Kontto</Text>
            <Text style={styles.welcomeSubtitle}>
              Inicia sesión o regístrate para comenzar a gestionar tus finanzas
            </Text>
          </View>

          {/* Benefits Section */}
          <Card style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>¿Por qué crear una cuenta?</Text>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.benefitTitle}>Sincroniza tus datos</Text>
                <Text style={styles.benefitText}>Accede desde cualquier dispositivo</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.benefitTitle}>Datos seguros</Text>
                <Text style={styles.benefitText}>Tu información está protegida</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="trending-up" size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.benefitTitle}>Mejores análisis</Text>
                <Text style={styles.benefitText}>Reportes más detallados y precisos</Text>
              </View>
            </View>
          </Card>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer Buttons (stacked vertically on not-logged-in view) */}
        <View style={[styles.footer, { paddingBottom: spacing.xl + (insets.bottom || 0), flexDirection: 'column' }]}>
          <Button
            title="Iniciar Sesión"
            variant="solidPrimary"
            onPress={() => {
              setAuthTab('login');
              setShowAuthModal(true);
            }}
            style={{ marginBottom: spacing.sm, width: '100%' }}
          />
          <Button
            title="Crear Cuenta"
            variant="outline"
            onPress={() => {
              setAuthTab('register');
              setShowAuthModal(true);
            }}
            style={{ width: '100%' }}
          />
        </View>

        {/* Auth Modal */}
        <Modal
          visible={showAuthModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAuthModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, authTab === 'login' && styles.tabActive]}
                  onPress={() => {
                    setAuthTab('login');
                    setLoginError('');
                    setRegisterError('');
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      authTab === 'login' && styles.tabTextActive,
                    ]}
                  >
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, authTab === 'register' && styles.tabActive]}
                  onPress={() => {
                    setAuthTab('register');
                    setLoginError('');
                    setRegisterError('');
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      authTab === 'register' && styles.tabTextActive,
                    ]}
                  >
                    Registrarse
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {authTab === 'login' ? (
                  <>
                    {/* Login Form */}
                    {loginError && (
                      <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={20} color={colors.error} />
                        <Text style={styles.errorText}>{loginError}</Text>
                      </View>
                    )}

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Correo Electrónico</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="tu@email.com"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="email-address"
                        value={loginEmail}
                        onChangeText={setLoginEmail}
                        editable={!loginLoading}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Contraseña</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Contraseña"
                          placeholderTextColor={colors.textTertiary}
                          secureTextEntry={!showLoginPassword}
                          value={loginPassword}
                          onChangeText={setLoginPassword}
                          editable={!loginLoading}
                        />
                        <TouchableOpacity
                          onPress={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          <Ionicons
                            name={showLoginPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Button
                      title={loginLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                      variant="solidPrimary"
                      onPress={handleLogin}
                      style={{ marginTop: spacing.lg }}
                    />
                  </>
                ) : (
                  <>
                    {/* Register Form */}
                    {registerError && (
                      <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={20} color={colors.error} />
                        <Text style={styles.errorText}>{registerError}</Text>
                      </View>
                    )}

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nombre Completo</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Tu nombre"
                        placeholderTextColor={colors.textTertiary}
                        value={registerName}
                        onChangeText={setRegisterName}
                        editable={!registerLoading}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Correo Electrónico</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="tu@email.com"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="email-address"
                        value={registerEmail}
                        onChangeText={setRegisterEmail}
                        editable={!registerLoading}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Contraseña</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Al menos 6 caracteres"
                          placeholderTextColor={colors.textTertiary}
                          secureTextEntry={!showRegisterPassword}
                          value={registerPassword}
                          onChangeText={setRegisterPassword}
                          editable={!registerLoading}
                        />
                        <TouchableOpacity
                          onPress={() => setShowRegisterPassword(!showRegisterPassword)}
                        >
                          <Ionicons
                            name={showRegisterPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Confirmar Contraseña</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Repite tu contraseña"
                          placeholderTextColor={colors.textTertiary}
                          secureTextEntry={!showRegisterConfirm}
                          value={registerConfirmPassword}
                          onChangeText={setRegisterConfirmPassword}
                          editable={!registerLoading}
                        />
                        <TouchableOpacity
                          onPress={() => setShowRegisterConfirm(!showRegisterConfirm)}
                        >
                          <Ionicons
                            name={showRegisterConfirm ? 'eye' : 'eye-off'}
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Button
                      title={registerLoading ? 'Registrando...' : 'Crear Cuenta'}
                      variant="solidPrimary"
                      onPress={handleRegister}
                      style={{ marginTop: spacing.lg }}
                    />
                  </>
                )}

                <View style={{ height: 40 }} />
              </ScrollView>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAuthModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }

  // If logged in, show profile
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-circle" size={80} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.fullName}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileDate}>
              Miembro desde{' '}
              {new Date(user.createdAt).toLocaleDateString('es-HN', {
                year: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
        </Card>

        {/* Profile Details */}
        {editMode ? (
          <>
            <Text style={styles.sectionTitle}>Editar Perfil</Text>
            <Card style={styles.editCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Tu correo"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Tu teléfono"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Biografía (Opcional)</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Cuéntanos sobre ti"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </Card>

            <View style={[styles.footer, { paddingBottom: spacing.xl + (insets.bottom || 0) }]}>
              <Button
                title="Guardar"
                variant="solidPrimary"
                onPress={handleSaveProfile}
                style={{ marginBottom: spacing.sm, flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => {
                  setEditMode(false);
                  setEditName(user.fullName);
                  setEditEmail(user.email);
                  setEditPhone(user.phone || '');
                  setEditBio(user.bio || '');
                }}
                style={{ flex: 1 }}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Información</Text>
            <Card style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="mail" size={20} color={colors.primary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Correo Electrónico</Text>
                    <Text style={styles.detailValue}>{user.email}</Text>
                  </View>
                </View>
              </View>

              {user.phone && (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Ionicons name="call" size={20} color={colors.primary} />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Teléfono</Text>
                        <Text style={styles.detailValue}>{user.phone}</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              {user.bio && (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Ionicons name="document-text" size={20} color={colors.primary} />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Biografía</Text>
                        <Text style={styles.detailValue}>{user.bio}</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Miembro desde</Text>
                    <Text style={styles.detailValue}>
                      {new Date(user.createdAt).toLocaleDateString('es-HN')}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            <View style={[styles.footer, { paddingBottom: spacing.xl + (insets.bottom || 0) }]}>
              <Button
                title="Editar Perfil"
                variant="solidPrimary"
                onPress={() => setEditMode(true)}
                style={{ marginBottom: spacing.sm }}
              />
              <Button
                title="Cerrar Sesión"
                variant="outline"
                onPress={handleLogout}
              />
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any, br: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    flexDirection: 'row',
  },

  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  welcomeIcon: {
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },

  // Benefits Section
  benefitsCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  benefitsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  benefitIcon: {
    marginTop: spacing.xs,
  },
  benefitTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  benefitText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: br.lg,
    borderTopRightRadius: br.lg,
    maxHeight: '85%',
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  modalBody: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.sm,
    zIndex: 10,
  },

  // Form
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: br.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: br.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  bioInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  errorBox: {
    backgroundColor: colors.error + '15',
    borderRadius: br.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: typography.weights.medium,
  },

  // Profile
  profileHeader: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileAvatar: {
    marginBottom: spacing.md,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profileDate: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },

  // Sections
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  editCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
