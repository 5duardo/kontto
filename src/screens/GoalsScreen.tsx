// Goal creation screen with full currency support
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { Card, Button, ProgressBar } from '../components/common';
import { CurrencySelector } from '../components/CurrencySelector';

const goalIcons = [
  'airplane',
  'car-sport',
  'home',
  'cash',
  'laptop',
  'medical',
  'school',
  'gift',
  'shield-checkmark',
  'restaurant',
];

export const GoalsScreen = () => {
  const { goals, addGoal, updateGoal, deleteGoal, addToGoal, preferredCurrency } = useAppStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);

  const [modalVisible, setModalVisible] = useState(false);
  const [addMoneyModalVisible, setAddMoneyModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(goalIcons[0]);
  const [selectedColor, setSelectedColor] = useState(colors.categoryColors[0]);
  const [targetDate, setTargetDate] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(preferredCurrency);

  const formatCurrency = (amount: number) => {
    return `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddGoal = () => {
    if (!name || !targetAmount) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    addGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      targetDate: targetDate || futureDate.toISOString(),
      icon: selectedIcon,
      color: selectedColor,
      description,
      currency: selectedCurrency,
      includeInTotal: true,
    });

    setModalVisible(false);
    resetForm();
  };

  const handleAddMoney = () => {
    if (!addAmount || !selectedGoalId) return;

    addToGoal(selectedGoalId, parseFloat(addAmount));
    setAddMoneyModalVisible(false);
    setAddAmount('');
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setDescription('');
    setSelectedIcon(goalIcons[0]);
    setSelectedColor(colors.categoryColors[0]);
    setTargetDate('');
    setSelectedCurrency(preferredCurrency);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="trophy-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay metas</Text>
            <Text style={styles.emptySubtext}>
              Establece una meta de ahorro para alcanzar tus objetivos
            </Text>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = goal.currentAmount / goal.targetAmount;
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysRemaining = Math.ceil(
              (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Card key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalLeft}>
                    <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
                      <Ionicons name={goal.icon as any} size={32} color={goal.color} />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      {goal.description && (
                        <Text style={styles.goalDescription}>{goal.description}</Text>
                      )}
                      <Text style={styles.goalDate}>
                        {daysRemaining > 0
                          ? `${daysRemaining} días restantes`
                          : 'Meta vencida'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.goalAmounts}>
                  <View>
                    <Text style={styles.goalAmountLabel}>Ahorrado</Text>
                    <Text style={[styles.goalAmountValue, { color: goal.color }]}>
                      {formatCurrency(goal.currentAmount)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.goalAmountLabel}>Meta</Text>
                    <Text style={styles.goalAmountValue}>
                      {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.goalAmountLabel}>Falta</Text>
                    <Text style={styles.goalAmountValue}>{formatCurrency(remaining)}</Text>
                  </View>
                </View>

                <ProgressBar
                  progress={progress}
                  color={goal.color}
                  showPercentage
                />

                {progress < 1 && (
                  <TouchableOpacity
                    style={[styles.addMoneyButton, { backgroundColor: `${goal.color}20` }]}
                    onPress={() => {
                      setSelectedGoalId(goal.id);
                      setAddMoneyModalVisible(true);
                    }}
                  >
                    <Ionicons name="add-circle" size={20} color={goal.color} />
                    <Text style={[styles.addMoneyText, { color: goal.color }]}>
                      Agregar Dinero
                    </Text>
                  </TouchableOpacity>
                )}

                {progress >= 1 && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <Text style={styles.completedText}>¡Meta Completada!</Text>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Meta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Nombre de la meta *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Viaje a la playa"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Monto objetivo *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción de tu meta"
                placeholderTextColor={colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Ícono</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                {goalIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedIcon === icon && styles.iconButtonActive,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={selectedIcon === icon ? '#fff' : colors.textPrimary}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                {colors.categoryColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonActive,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                modalTitle="Seleccionar moneda para tu meta"
                label="Moneda de la meta"
                showFullName={true}
              />

              <Button title="Crear Meta" onPress={handleAddGoal} fullWidth variant="solidPrimary" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal
        visible={addMoneyModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAddMoneyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '50%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Dinero</Text>
              <TouchableOpacity onPress={() => setAddMoneyModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Monto a agregar</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="decimal-pad"
                autoFocus
              />

              <Button title="Agregar" onPress={handleAddMoney} fullWidth variant="solidPrimary" />
            </View>
          </View>
        </View>
      </Modal>
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
    padding: spacing.lg,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing['3xl'],
    marginTop: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  goalCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  goalLeft: {
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  goalIcon: {
    width: 64,
    height: 64,
    borderRadius: br.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  goalDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  goalDate: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  goalAmountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  goalAmountValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: br.md,
    marginTop: spacing.md,
  },
  addMoneyText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: `${colors.success}20`,
    borderRadius: br.md,
    marginTop: spacing.md,
  },
  completedText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: br.xl,
    borderTopRightRadius: br.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: br.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconScroll: {
    marginBottom: spacing.md,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: br.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  iconButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  colorScroll: {
    marginBottom: spacing.lg,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: br.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: colors.textPrimary,
  },
});
