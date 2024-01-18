# from celery import shared_task
# import requests
# from bs4 import BeautifulSoup
# import random


# USER_AGENTS_JSON_LIST_URL = "https://jnrbsn.github.io/user-agents/user-agents.json"

# @shared_task
# def scrape_amazon_product(product_url: str) -> None:
#     """Scrape the product details from the given Amazon product URL."""

#     user_agents_list = requests.get(USER_AGENTS_JSON_LIST_URL).json()
#     user_agent = random.choice(user_agents_list)

#     headers = {
#         "User-Agent": user_agent,
#     }

#     response = requests.get(product_url, headers=headers)

#     soup = BeautifulSoup(response.content, "html.parser")

#     title = soup.find(id="productTitle").get_text().strip()
#     price = soup.select_one(selector="#corePrice_feature_div > div > div > span.a-price.aok-align-center > span.a-offscreen").get_text().strip()
#     image_url = soup.find(id="landingImage")["src"]
#     sub_category = soup.select_one(selector="#wayfinding-breadcrumbs_feature_div > ul > li:nth-child(3) > span > a").get_text().strip()
#     category = soup.select_one(selector="#wayfinding-breadcrumbs_feature_div > ul > li:nth-child(4) > span > a").get_text().strip()
