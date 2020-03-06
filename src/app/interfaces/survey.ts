export interface Survey {
  title: string;
  description: string;
  store_type: string;
  status: string;
  user_id: string;
  manufacturer_id: string;
  reward_points: number;
  reward_wallet: number;
}

export interface Question {
  type: string;
  title: string;
  index: number;
  status: string;
  survey_id: string;
}

export interface Choice {
  title: string;
  index: number;
  status: string;
  question_id: string;
}
