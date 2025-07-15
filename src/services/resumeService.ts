import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { googleDriveService } from './googleDriveService';
import type { Resume, UploadProgress } from '../types';

export const resumeService = {
  async uploadResume(
    file: File, 
    userId: string, 
    onProgress: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; resumeId?: string; error?: string }> {
    try {
      onProgress({ progress: 10, status: 'uploading' });
      
      // Upload to Google Drive
      const uploadResult = await googleDriveService.uploadFile(file, userId);
      
      if (!uploadResult.success) {
        onProgress({ progress: 0, status: 'error', error: uploadResult.error });
        return { success: false, error: uploadResult.error };
      }
      
      onProgress({ progress: 70, status: 'uploading' });
      
      // Save metadata to Firestore
      const resumeData = {
        userId,
        filename: file.name,
        originalName: file.name,
        uploadTime: new Date(),
        fileSize: file.size,
        driveFileId: uploadResult.fileId,
        analysisStatus: 'pending' as const,
      };
      
      const docRef = await addDoc(collection(db, 'resumes'), resumeData);
      
      onProgress({ progress: 100, status: 'completed' });
      return { success: true, resumeId: docRef.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onProgress({ progress: 0, status: 'error', error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  async getUserResumes(userId: string): Promise<Resume[]> {
    try {
      const q = query(
        collection(db, 'resumes'),
        where('userId', '==', userId),
        orderBy('uploadTime', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const resumes: Resume[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resumes.push({
          id: doc.id,
          ...data,
          uploadTime: data.uploadTime.toDate(),
          analysisStatus: data.analysisStatus || 'pending',
        } as Resume);
      });
      
      return resumes;
    } catch (error) {
      console.error('Error getting user resumes:', error);
      return [];
    }
  },

  async deleteResume(resumeId: string, driveFileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete from Google Drive
      await googleDriveService.deleteFile(driveFileId);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'resumes', resumeId));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  },

  async getResumeUrl(driveFileId: string): Promise<string | null> {
    return await googleDriveService.getFileUrl(driveFileId);
  },

  async updateResumeAnalysis(resumeId: string, analysis: Resume['analysis']): Promise<{ success: boolean; error?: string }> {
    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      await updateDoc(resumeRef, {
        analysis: {
          ...analysis,
          analyzedAt: new Date(),
        },
        analysisStatus: 'completed',
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
};
