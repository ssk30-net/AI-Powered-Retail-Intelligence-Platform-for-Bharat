"""
STEP 5: Deploy to SageMaker
Automated deployment of trained model to AWS SageMaker
"""

import boto3
import sagemaker
from sagemaker.xgboost import XGBoostModel
import joblib
import json
import os
import logging
from datetime import datetime
import tarfile

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SageMakerDeployer:
    """Deploy model to AWS SageMaker"""
    
    def __init__(self):
        self.model_dir = 'models'
        self.region = 'eu-north-1'  # Change to your region
        self.bucket_name = 'ai-market-pulse-models'  # Change to your bucket
        self.model_name = 'commodity-price-predictor'
        self.endpoint_name = 'commodity-price-predictor-endpoint'
        
        # AWS clients
        self.s3_client = None
        self.sagemaker_client = None
        self.sagemaker_session = None
        self.role = None
        
    def setup_aws(self):
        """Setup AWS clients and session"""
        logger.info("Setting up AWS clients...")
        
        try:
            # Create AWS clients
            self.s3_client = boto3.client('s3', region_name=self.region)
            self.sagemaker_client = boto3.client('sagemaker', region_name=self.region)
            
            # Create SageMaker session
            self.sagemaker_session = sagemaker.Session(
                boto_session=boto3.Session(region_name=self.region)
            )
            
            # Get execution role
            self.role = sagemaker.get_execution_role()
            
            logger.info(f"✓ AWS clients configured")
            logger.info(f"  Region: {self.region}")
            logger.info(f"  Role: {self.role}")
            
        except Exception as e:
            logger.error(f"Failed to setup AWS: {e}")
            logger.info("\nMake sure:")
            logger.info("  1. AWS CLI is configured (run: aws configure)")
            logger.info("  2. You have SageMaker execution role")
            logger.info("  3. You have permissions for S3 and SageMaker")
            raise
    
    def create_s3_bucket(self):
        """Create S3 bucket if it doesn't exist"""
        logger.info(f"Checking S3 bucket: {self.bucket_name}...")
        
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"✓ Bucket exists: {self.bucket_name}")
        except:
            logger.info(f"Creating bucket: {self.bucket_name}...")
            try:
                if self.region == 'us-east-1':
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                else:
                    self.s3_client.create_bucket(
                        Bucket=self.bucket_name,
                        CreateBucketConfiguration={'LocationConstraint': self.region}
                    )
                logger.info(f"✓ Bucket created: {self.bucket_name}")
            except Exception as e:
                logger.error(f"Failed to create bucket: {e}")
                raise
    
    def package_model(self):
        """Package model artifacts for SageMaker"""
        logger.info("Packaging model artifacts...")
        
        # Create tar.gz file
        model_tar = os.path.join(self.model_dir, 'model.tar.gz')
        
        with tarfile.open(model_tar, 'w:gz') as tar:
            # Add model file
            model_file = os.path.join(self.model_dir, 'xgboost_price_predictor.pkl')
            tar.add(model_file, arcname='xgboost_price_predictor.pkl')
            
            # Add scaler
            scaler_file = os.path.join(self.model_dir, 'scaler.pkl')
            tar.add(scaler_file, arcname='scaler.pkl')
            
            # Add feature names
            feature_file = os.path.join(self.model_dir, 'feature_names.json')
            tar.add(feature_file, arcname='feature_names.json')
        
        logger.info(f"✓ Model packaged: {model_tar}")
        return model_tar
    
    def upload_to_s3(self, model_tar):
        """Upload model to S3"""
        logger.info(f"Uploading model to S3...")
        
        s3_key = f"models/{self.model_name}/{datetime.now().strftime('%Y%m%d-%H%M%S')}/model.tar.gz"
        
        try:
            self.s3_client.upload_file(
                model_tar,
                self.bucket_name,
                s3_key
            )
            
            s3_uri = f"s3://{self.bucket_name}/{s3_key}"
            logger.info(f"✓ Model uploaded: {s3_uri}")
            return s3_uri
            
        except Exception as e:
            logger.error(f"Failed to upload to S3: {e}")
            raise
    
    def create_model(self, model_data_url):
        """Create SageMaker model"""
        logger.info("Creating SageMaker model...")
        
        # XGBoost container image
        container = sagemaker.image_uris.retrieve(
            framework='xgboost',
            region=self.region,
            version='1.5-1'
        )
        
        model_name = f"{self.model_name}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        try:
            response = self.sagemaker_client.create_model(
                ModelName=model_name,
                PrimaryContainer={
                    'Image': container,
                    'ModelDataUrl': model_data_url,
                    'Environment': {
                        'SAGEMAKER_PROGRAM': 'inference.py',
                        'SAGEMAKER_SUBMIT_DIRECTORY': model_data_url
                    }
                },
                ExecutionRoleArn=self.role
            )
            
            logger.info(f"✓ Model created: {model_name}")
            return model_name
            
        except Exception as e:
            logger.error(f"Failed to create model: {e}")
            raise
    
    def create_endpoint_config(self, model_name):
        """Create endpoint configuration"""
        logger.info("Creating endpoint configuration...")
        
        config_name = f"{model_name}-config"
        
        try:
            response = self.sagemaker_client.create_endpoint_config(
                EndpointConfigName=config_name,
                ProductionVariants=[{
                    'VariantName': 'AllTraffic',
                    'ModelName': model_name,
                    'InitialInstanceCount': 1,
                    'InstanceType': 'ml.t2.medium',
                    'InitialVariantWeight': 1
                }]
            )
            
            logger.info(f"✓ Endpoint config created: {config_name}")
            return config_name
            
        except Exception as e:
            logger.error(f"Failed to create endpoint config: {e}")
            raise
    
    def create_endpoint(self, config_name):
        """Create SageMaker endpoint"""
        logger.info("Creating SageMaker endpoint...")
        logger.info("This may take 5-10 minutes...")
        
        try:
            # Check if endpoint exists
            try:
                self.sagemaker_client.describe_endpoint(EndpointName=self.endpoint_name)
                logger.info(f"Endpoint already exists: {self.endpoint_name}")
                logger.info("Updating endpoint...")
                
                response = self.sagemaker_client.update_endpoint(
                    EndpointName=self.endpoint_name,
                    EndpointConfigName=config_name
                )
            except:
                logger.info(f"Creating new endpoint: {self.endpoint_name}")
                
                response = self.sagemaker_client.create_endpoint(
                    EndpointName=self.endpoint_name,
                    EndpointConfigName=config_name
                )
            
            # Wait for endpoint to be in service
            logger.info("Waiting for endpoint to be ready...")
            waiter = self.sagemaker_client.get_waiter('endpoint_in_service')
            waiter.wait(EndpointName=self.endpoint_name)
            
            logger.info(f"✓ Endpoint ready: {self.endpoint_name}")
            return self.endpoint_name
            
        except Exception as e:
            logger.error(f"Failed to create endpoint: {e}")
            raise
    
    def test_endpoint(self):
        """Test the deployed endpoint"""
        logger.info("\nTesting endpoint...")
        
        # Create runtime client
        runtime = boto3.client('sagemaker-runtime', region_name=self.region)
        
        # Sample input (you'll need to adjust this based on your features)
        sample_input = {
            'price_lag_1': 2500,
            'price_lag_7': 2480,
            'price_rolling_mean_7': 2490,
            'avg_sentiment': 0.3
        }
        
        try:
            response = runtime.invoke_endpoint(
                EndpointName=self.endpoint_name,
                ContentType='application/json',
                Body=json.dumps(sample_input)
            )
            
            result = json.loads(response['Body'].read().decode())
            logger.info(f"✓ Endpoint test successful!")
            logger.info(f"  Sample prediction: {result}")
            
        except Exception as e:
            logger.warning(f"Endpoint test failed: {e}")
            logger.info("You may need to create a custom inference script")
    
    def save_deployment_info(self, model_name, endpoint_name):
        """Save deployment information"""
        logger.info("Saving deployment information...")
        
        deployment_info = {
            'deployed_at': datetime.now().isoformat(),
            'region': self.region,
            'bucket': self.bucket_name,
            'model_name': model_name,
            'endpoint_name': endpoint_name,
            'endpoint_url': f"https://runtime.sagemaker.{self.region}.amazonaws.com/endpoints/{endpoint_name}/invocations"
        }
        
        info_path = os.path.join(self.model_dir, 'deployment_info.json')
        with open(info_path, 'w') as f:
            json.dump(deployment_info, f, indent=2)
        
        logger.info(f"✓ Deployment info saved: {info_path}")
    
    def generate_summary(self, endpoint_name):
        """Generate deployment summary"""
        logger.info("\n" + "=" * 80)
        logger.info("DEPLOYMENT SUMMARY")
        logger.info("=" * 80)
        
        logger.info(f"\n✅ Model deployed to SageMaker!")
        logger.info(f"\nEndpoint Details:")
        logger.info(f"  Name: {endpoint_name}")
        logger.info(f"  Region: {self.region}")
        logger.info(f"  Instance: ml.t2.medium")
        
        logger.info(f"\nTo invoke endpoint:")
        logger.info(f"  aws sagemaker-runtime invoke-endpoint \\")
        logger.info(f"    --endpoint-name {endpoint_name} \\")
        logger.info(f"    --body '{{\"price_lag_1\": 2500}}' \\")
        logger.info(f"    --content-type application/json \\")
        logger.info(f"    output.json")
        
        logger.info(f"\nNext steps:")
        logger.info(f"  1. Integrate endpoint with backend API")
        logger.info(f"  2. Test predictions from frontend")
        logger.info(f"  3. Monitor endpoint performance")
        logger.info(f"  4. Set up auto-scaling (optional)")
        
        logger.info("\n" + "=" * 80)

def main():
    """Main execution"""
    logger.info("=" * 80)
    logger.info("STEP 5: DEPLOY TO SAGEMAKER")
    logger.info("=" * 80)
    
    deployer = SageMakerDeployer()
    
    try:
        # Setup AWS
        deployer.setup_aws()
        
        # Create S3 bucket
        deployer.create_s3_bucket()
        
        # Package model
        model_tar = deployer.package_model()
        
        # Upload to S3
        model_data_url = deployer.upload_to_s3(model_tar)
        
        # Create SageMaker model
        model_name = deployer.create_model(model_data_url)
        
        # Create endpoint configuration
        config_name = deployer.create_endpoint_config(model_name)
        
        # Create endpoint
        endpoint_name = deployer.create_endpoint(config_name)
        
        # Test endpoint
        deployer.test_endpoint()
        
        # Save deployment info
        deployer.save_deployment_info(model_name, endpoint_name)
        
        # Generate summary
        deployer.generate_summary(endpoint_name)
        
    except Exception as e:
        logger.error(f"Deployment failed: {e}")
        logger.info("\nTroubleshooting:")
        logger.info("  1. Check AWS credentials: aws configure")
        logger.info("  2. Verify SageMaker permissions")
        logger.info("  3. Check S3 bucket permissions")
        logger.info("  4. Review CloudWatch logs")
        raise

if __name__ == "__main__":
    main()
