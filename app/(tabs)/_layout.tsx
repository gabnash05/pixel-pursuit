import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

import "../../styles/global.css";

export default function TabLayout() {

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.light.primary,
                tabBarLabelStyle: {
                fontFamily: 'Inter_500Medium',
                },
            }}
        >
        <Tabs.Screen
            name="index"
            options={{
                title: 'Scan',
                tabBarIcon: ({ color }) => (
                    <MaterialIcons name="qr-code-scanner" size={24} color={color} />
                ),
            }}
        />
        <Tabs.Screen
            name="leaderboard"
            options={{
                title: 'Leaderboard',
                tabBarIcon: ({ color }) => (
                    <FontAwesome name="trophy" size={24} color={color} />
                ),
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
                title: 'Profile',
                tabBarIcon: ({ color }) => (
                    <FontAwesome name="user" size={24} color={color} />
                ),
            }}
        />
        </Tabs>
    );
}
