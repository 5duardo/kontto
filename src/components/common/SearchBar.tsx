import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';
import { Input } from './Input';

interface SearchBarProps {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    containerStyle?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Buscar...', containerStyle }) => {
    return (
        <Input
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            leftIcon={<Ionicons name="search" size={20} color="#6B7280" />}
            containerStyle={containerStyle}
        />
    );
};

export default SearchBar;

