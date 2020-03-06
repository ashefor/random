export interface Task {
  title: string;
  description: string;
  durationQty: number;
  durationType: string;
  periodQty: number;
  periodType: string;
  status: string;
  manufacturerId: string;
  storeType: string;
  rewardPoints: number;
  rewardCash: number;
}

export interface Meta {
  tag: string;
  value: string;
  id: string;
}

export interface EditMeta {
  tag: string;
  value: string;
  _id: string;
  status: string;
  task_id: string;
  created: number;
  modified?: number;
  id?: string;
}
