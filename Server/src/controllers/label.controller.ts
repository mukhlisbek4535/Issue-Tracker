import { Request, Response } from 'express';
import {
  createLabelService,
  deleteLabelService,
  getAllLabels,
} from '../services/label.service';

export const getLabels = async (req: Request, res: Response) => {
  try {
    const labels = await getAllLabels();
    res.status(200).json(labels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ message: 'Failed to fetch labels' });
  }
};

export const createLabel = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({
        message: 'Name and color are required',
      });
    }

    const label = await createLabelService(name, color);

    return res.status(201).json(label);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to create label',
    });
  }
};

export const deleteLabel = async (req: Request, res: Response) => {
  try {
    const labelId = req.params.id;

    await deleteLabelService(labelId);

    return res.json({
      message: 'Label deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to delete label',
    });
  }
};
