import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScreeningResult } from '@/hooks/useScreeningResults';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResult: ScreeningResult | null;
  noteText: string;
  onNoteTextChange: (text: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const NoteDialog: React.FC<NoteDialogProps> = ({
  open,
  onOpenChange,
  selectedResult,
  noteText,
  onNoteTextChange,
  onSave,
  isSaving = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedResult?.notes ? 'Edit Note' : 'Add Note'}
          </DialogTitle>
          <DialogDescription>
            Add your notes about {selectedResult?.first_name} {selectedResult?.last_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-text">Note</Label>
            <Textarea
              id="note-text"
              placeholder="Enter your notes about this candidate..."
              value={noteText}
              onChange={(e) => onNoteTextChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 