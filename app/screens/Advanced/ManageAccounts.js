import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, PlusCircle, XCircle, Search, SortAsc, SortDesc } from 'lucide-react';

const initialAccounts = [
  { id: '1', name: 'John Doe', avatar: 'https://via.placeholder.com/50' },
  { id: '2', name: 'Jane Smith', avatar: 'https://via.placeholder.com/50' },
];

const ManageAccountsScreen = () => {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState({ id: '', name: '', avatar: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    sortAccounts();
  }, [sortOrder]);

  const sortAccounts = () => {
    const sorted = [...accounts].sort((a, b) => 
      sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setAccounts(sorted);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleEdit = (id) => {
    const account = accounts.find((acc) => acc.id === id);
    setCurrentAccount(account);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Account', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAccounts(accounts.filter((acc) => acc.id !== id)) }
    ]);
  };

  const handleSave = () => {
    if (currentAccount.id) {
      setAccounts(accounts.map((acc) => acc.id === currentAccount.id ? currentAccount : acc));
    } else {
      setAccounts([...accounts, { ...currentAccount, id: Date.now().toString() }]);
    }
    setModalVisible(false);
    setCurrentAccount({ id: '', name: '', avatar: '' });
  };

  const filteredAccounts = accounts.filter((acc) => acc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text className="text-2xl font-bold mb-4">Manage Accounts</Text>

      <View className="flex-row items-center mb-4 space-x-2">
        <TextInput placeholder="Search..." value={searchQuery} onChangeText={handleSearch} className="flex-1 p-2 border rounded" />
        <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
        </TouchableOpacity>
      </View>

      <ScrollView>
        {filteredAccounts.map((item) => (
          <Card key={item.id} className="flex flex-row items-center p-2 mb-2 space-x-4">
            <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full" />
            <Text className="flex-1 text-lg font-medium">{item.name}</Text>
            <TouchableOpacity onPress={() => handleEdit(item.id)} className="p-2">
              <Edit className="w-5 h-5 text-blue-500" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
              <Trash className="w-5 h-5 text-red-500" />
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>

      <Button onPress={() => setModalVisible(true)} className="mt-4" variant="default">
        <PlusCircle className="w-5 h-5 mr-2" /> Add Account
      </Button>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <Card className="w-11/12 p-4 bg-white rounded-lg">
            <Text className="text-lg font-bold mb-2">{currentAccount.id ? 'Edit Account' : 'Add Account'}</Text>
            <TextInput placeholder="Name" value={currentAccount.name} onChangeText={(text) => setCurrentAccount({ ...currentAccount, name: text })} className="p-2 border rounded mb-2" />
            <TextInput placeholder="Avatar URL" value={currentAccount.avatar} onChangeText={(text) => setCurrentAccount({ ...currentAccount, avatar: text })} className="p-2 border rounded mb-4" />
            <Button onPress={handleSave}>{currentAccount.id ? 'Save Changes' : 'Add Account'}</Button>
          </Card>
        </View>
      </Modal>
    </View>
  );
};

export default ManageAccountsScreen;
