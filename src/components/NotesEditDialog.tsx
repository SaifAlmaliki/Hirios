import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAddNoteToScreeningResult } from '@/hooks/useScreeningResults';

interface NotesEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
  currentNotes?: string;
  candidateName: string;
}

const NotesEditDialog: React.FC<NotesEditDialogProps> = ({
  isOpen,
  onClose,
  resultId,
  currentNotes = '',
  candidateName
}) => {
  const [notes, setNotes] = useState('');
  const addNoteMutation = useAddNoteToScreeningResult();

  // Update notes when dialog opens or currentNotes changes
  useEffect(() => {
    if (isOpen) {
      setNotes(currentNotes);
    }
  }, [isOpen, currentNotes]);

  const handleSave = async () => {
    try {
      await addNoteMutation.mutateAsync({
        id: resultId,
        notes: notes.trim()
      });
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to save notes:', error);
    }
  };

  const handleCancel = () => {
    setNotes(currentNotes); // Reset to original value
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Notes for {candidateName}</DialogTitle>
          <DialogDescription>
            Add or edit your notes about this candidate. These notes will be visible to your team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter your notes about this candidate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={addNoteMutation.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={addNoteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={addNoteMutation.isPending}
          >
            {addNoteMutation.isPending ? 'Saving...' : 'Save Notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesEditDialog;
