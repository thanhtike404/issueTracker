import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type newChatType = 'PRIVATE' | 'GROUP'
function CreateChat({ showCreateChat, setShowCreateChat, newChatName, setNewChatName, newChatType, setNewChatType, handleCreateChat }: { showCreateChat: boolean, setShowCreateChat: (show: boolean) => void, newChatName: string, setNewChatName: (name: string) => void, newChatType:  newChatType, setNewChatType: (type: newChatType) => void, handleCreateChat: () => void }) {
  return (
    <Dialog open={showCreateChat} onOpenChange={setShowCreateChat}>
    <DialogTrigger asChild>
      <Button size="sm" variant="outline">
        <Plus className="h-4 w-4" />
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Chat</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Input
          placeholder="Chat name"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
        />
        <Select value={newChatType} onValueChange={(value: 'PRIVATE' | 'GROUP') => setNewChatType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRIVATE">Private</SelectItem>
            <SelectItem value="GROUP">Group</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleCreateChat} className="w-full">
          Create Chat
        </Button>
      </div>
    </DialogContent>
  </Dialog>
  )
}

export default CreateChat