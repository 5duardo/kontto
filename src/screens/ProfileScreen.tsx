import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';

interface ProfileField {
  id: string;
  label: string;
  value: string;
  icon: string;
  editable?: boolean;
}

const INITIAL_PROFILE_FIELDS: ProfileField[] = [
  {
    id: 'name',
    label: 'Nombre completo',
    value: 'Usuario',
    icon: 'person',
    editable: true,
  },
  {
    id: 'email',
    label: 'Correo electrónico',
    value: 'usuario@example.com',
    icon: 'mail',
    editable: true,
  },
  {
    id: 'phone',
    label: 'Teléfono',
    value: '+1 (555) 123-4567',
    icon: 'call',
    editable: true,
  },
];

export const ProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [profileFields, setProfileFields] = React.useState(INITIAL_PROFILE_FIELDS);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedValues, setEditedValues] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    INITIAL_PROFILE_FIELDS.forEach(field => {
      initial[field.id] = field.value;
    });
    return initial;
  });

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const handleEdit = (fieldId: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSave = () => {
    setProfileFields(prev =>
      prev.map(field => ({
        ...field,
        value: editedValues[field.id],
      }))
    );
    setIsEditing(false);
    Alert.alert('Éxito', 'Tu perfil ha sido actualizado correctamente');
  };

  const handleCancel = () => {
    const initial: Record<string, string> = {};
    profileFields.forEach(field => {
      initial[field.id] = field.value;
    });
    setEditedValues(initial);
    setIsEditing(false);
  };

  const renderProfileField = (field: ProfileField) => (
    <View key={field.id} style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
          <Ionicons name={field.icon as any} size={20} color={colors.primary} />
        </View>
        <Text style={styles.fieldLabel}>{field.label}</Text>
      </View>
      {isEditing && field.editable ? (
        <TextInput
          style={styles.input}
          value={editedValues[field.id]}
          onChangeText={(value) => handleEdit(field.id, value)}
          placeholderTextColor={colors.textSecondary}
          editable={true}
        />
      ) : (
        <Text style={styles.fieldValue}>{editedValues[field.id]}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Create Account Section */}
        <View style={styles.createAccountSection}>
          <Ionicons name="alert-circle" size={60} color={colors.textSecondary} />
          <Text style={styles.createAccountTitle}>Configura tu perfil</Text>
          <Text style={styles.createAccountSubtitle}>
            Crea una cuenta para comenzar a gestionar tus finanzas
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={styles.emptyButtonText}>Crear primera cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color={colors.primary} />
          </View>
          <Text style={styles.profileName}>{profileFields.find(f => f.id === 'name')?.value || 'Usuario'}</Text>
          <Text style={styles.profileSubtitle}>Miembro desde 2024</Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.fieldsSection}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <View style={styles.fieldsCard}>
            {profileFields.map((field, index) => (
              <View key={field.id}>
                {renderProfileField(field)}
                {index < profileFields.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones de cuenta</Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.warning}20` }]}
            onPress={() => {
              Alert.alert(
                'Cambiar contraseña',
                'Serás redirigido a verificar tu identidad',
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="key" size={20} color={colors.warning} />
            <Text style={[styles.actionButtonText, { color: colors.warning }]}>
              Cambiar contraseña
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.error}20`, marginTop: spacing.md }]}
            onPress={() => {
              Alert.alert(
                'Eliminar cuenta',
                '¿Estás seguro? Esta acción no puede deshacerse.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Eliminar', style: 'destructive' },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>
              Eliminar cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Edit/Save Buttons */}
        <View style={styles.bottomButtons}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary, flex: 1, marginLeft: spacing.md }]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>Guardar cambios</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={18} color="#FFF" />
              <Text style={[styles.buttonText, { color: '#FFF', marginLeft: spacing.sm }]}>Editar perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  createAccountSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createAccountTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  createAccountSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
    gap: spacing.md,
    width: '100%',
  },
  emptyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: '#FFF',
  },
  emptyButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 2,
    gap: spacing.md,
    width: '100%',
  },
  emptyButtonSecondaryText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  profileName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profileSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  fieldsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  actionsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  fieldsCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginLeft: spacing.md + spacing.sm,
  },
  input: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginLeft: spacing.md + spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  actionButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
