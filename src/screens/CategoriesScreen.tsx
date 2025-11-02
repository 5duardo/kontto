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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Category } from '../types';

const CATEGORY_ICONS = [
  'briefcase', 'laptop', 'trending-up', 'cash',
  'restaurant', 'car', 'home', 'game-controller',
  'medkit', 'school', 'cart', 'flash',
  'pizza', 'beer', 'wine', 'book',
];

const CATEGORY_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#06B6D4',
  '#EF4444', '#F59E0B', '#EC4899', '#6B7280',
  '#14B8A6', '#F97316', '#7C3AED', '#F43F5E',
  '#A78BFA', '#84CC16', '#A16207', '#0891B2',
];

export const CategoriesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('cart');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');

  const categories = useAppStore((state) => state.categories);
  const addCategory = useAppStore((state) => state.addCategory);
  const updateCategory = useAppStore((state) => state.updateCategory);
  const deleteCategory = useAppStore((state) => state.deleteCategory);
  const canCreateCategory = useAppStore((state) => state.canCreateCategory);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const openAddModal = (type: 'income' | 'expense') => {
    // Check free limits before opening
    if (!canCreateCategory(type)) {
      Alert.alert(
        'Límite alcanzado',
        'Has alcanzado el límite de categorías del plan gratuito. Actualiza a Pro para crear más.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Obtener Pro', onPress: () => navigation.navigate('GetPro') },
        ]
      );
      return;
    }

    setCategoryName('');
    setSelectedIcon('cart');
    setSelectedColor('#10B981');
    setEditingCategory(null);
    setCategoryType(type);
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setCategoryName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setEditingCategory(category);
    setCategoryType(category.type);
    setModalVisible(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'El nombre de la categoría no puede estar vacío');
      return;
    }

    // Check again in case the limit changed while modal was open
    if (!editingCategory && !canCreateCategory(categoryType)) {
      Alert.alert(
        'Límite alcanzado',
        'Has alcanzado el límite de categorías del plan gratuito. Actualiza a Pro para crear más.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Obtener Pro', onPress: () => navigation.navigate('GetPro') },
        ]
      );
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
    } else {
      addCategory({
        name: categoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: categoryType,
        isDefault: false,
      });
    }

    setModalVisible(false);
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Estás seguro de que deseas eliminar "${category.name}"?`,
      [
        {
          text: 'Cancelar',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            deleteCategory(category.id);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderCategory = (category: Category) => (
    <View key={category.id} style={styles.categoryCard}>
      <TouchableOpacity
        style={styles.categoryContent}
        onPress={() => openEditModal(category)}
      >
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
            <Ionicons name={category.icon as any} size={24} color={category.color} />
          </View>
          <View>
            <Text style={styles.categoryName}>{category.name}</Text>
            {category.isDefault && (
              <Text style={styles.defaultBadge}>Por defecto</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      {!category.isDefault && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCategory(category)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.expense} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Ingresos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="arrow-down-circle" size={24} color={colors.success} />
            <Text style={styles.sectionTitle}>Ingresos</Text>
          </View>
          <View style={styles.categoriesList}>
            {incomeCategories.length > 0 ? (
              incomeCategories.map(renderCategory)
            ) : (
              <Text style={styles.emptyText}>No hay categorías de ingresos</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => openAddModal('income')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.addCategoryButtonText}>Agregar categoría de ingreso</Text>
          </TouchableOpacity>
        </View>

        {/* Gastos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="arrow-up-circle" size={24} color={colors.expense} />
            <Text style={styles.sectionTitle}>Gastos</Text>
          </View>
          <View style={styles.categoriesList}>
            {expenseCategories.length > 0 ? (
              expenseCategories.map(renderCategory)
            ) : (
              <Text style={styles.emptyText}>No hay categorías de gastos</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => openAddModal('expense')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.addCategoryButtonText}>Agregar categoría de gasto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal para agregar/editar categoría */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Nombre */}
              <View style={styles.section}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Alimentación"
                  placeholderTextColor={colors.textSecondary}
                  value={categoryName}
                  onChangeText={setCategoryName}
                />
              </View>

              {/* Tipo - Solo si está creando */}
              {!editingCategory && (
                <View style={styles.section}>
                  <Text style={styles.label}>Tipo</Text>
                  <View style={styles.typeButtonsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        categoryType === 'income' && styles.typeButtonSelected,
                      ]}
                      onPress={() => setCategoryType('income')}
                    >
                      <Ionicons
                        name="arrow-down-circle"
                        size={20}
                        color={categoryType === 'income' ? colors.success : colors.textSecondary}
                      />
                      <Text style={[
                        styles.typeButtonText,
                        categoryType === 'income' && styles.typeButtonTextSelected,
                      ]}>
                        Ingreso
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        categoryType === 'expense' && styles.typeButtonSelected,
                      ]}
                      onPress={() => setCategoryType('expense')}
                    >
                      <Ionicons
                        name="arrow-up-circle"
                        size={20}
                        color={categoryType === 'expense' ? colors.expense : colors.textSecondary}
                      />
                      <Text style={[
                        styles.typeButtonText,
                        categoryType === 'expense' && styles.typeButtonTextSelected,
                      ]}>
                        Gasto
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Ícono */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.label}>Ícono</Text>
                  <Ionicons name={selectedIcon as any} size={24} color={selectedColor} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.iconGrid}>
                    {CATEGORY_ICONS.map((icon) => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          styles.iconButton,
                          selectedIcon === icon && styles.iconButtonSelected,
                        ]}
                        onPress={() => setSelectedIcon(icon)}
                      >
                        <Ionicons
                          name={icon as any}
                          size={24}
                          color={selectedIcon === icon ? colors.primary : colors.textSecondary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Color */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.label}>Color</Text>
                  <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.colorRow}>
                    {CATEGORY_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorButton,
                          { backgroundColor: color },
                          selectedColor === color && styles.colorButtonSelected,
                        ]}
                        onPress={() => setSelectedColor(color)}
                      >
                        {selectedColor === color && (
                          <Ionicons name="checkmark" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Botones de acción */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveCategory}
              >
                <Text style={styles.saveButtonText}>
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  categoriesList: {
    gap: spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    paddingRight: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  defaultBadge: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: spacing.md,
  },
  addCategoryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  // Type buttons
  typeButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  typeButtonSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  typeButtonTextSelected: {
    color: colors.textPrimary,
  },
  // Icon grid
  iconGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.backgroundSecondary,
  },
  // Color row
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  colorButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
  },
});

